/**
 * Component - Migration Component
 *
 * @file Migration.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {getRegionClient} from '../../../api/client';

import {
    MENU_COPY_COMMAND,
    MENU_MOVE_COMMAND,
    MENU_RENAME_COMMAND
} from '../../../actions/context';
import Rename from './rename';
import Copy from './copy';

export default class Migration extends Component {
    static propTypes = {
        command: PropTypes.symbol,
        visible: PropTypes.bool.isRequired,
        onCancel: PropTypes.func.isRequired,
        onMigration: PropTypes.func.isRequired,

        region: PropTypes.string,
        bucket: PropTypes.string,
        object: PropTypes.string
    };

    state = {
        buckets: []
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.command === MENU_COPY_COMMAND) {
            // 获取buckets
            const client = getRegionClient();
            client.listBuckets().then(res => {
                const buckets = res.buckets.map(
                    bucket => ({
                        label: bucket.name,
                        value: bucket.name,
                        isLeaf: false
                    })
                );

                this.setState({buckets});
            });
        }
    }

    onRename = () => {
        const {form, props} = this;
        const {bucket, object} = props;

        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            const objectParts = object.split('/');
            if (objectParts[objectParts.length - 1]) {
                objectParts[objectParts.length - 1] = values.name;
            } else {
                objectParts[objectParts.length - 2] = values.name;
            }

            this.props.onMigration({
                sourceBucket: bucket,
                sourceObject: object,
                targetBucket: bucket,
                targetObject: objectParts.join('/')
            }, true);
        });
    }

    onCopy = () => {
        const {form, props} = this;
        const {bucket, object} = props;

        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            const targetBucket = values.path[0];
            const targetObject = values.path[1] || '';
            const targetName = object.endsWith('/')
                ? object.replace(/(.*\/)?(.*\/)$/, '$2')
                : object.replace(/(.*\/)?(.*)$/, '$2');

            this.props.onMigration({
                sourceBucket: bucket,
                sourceObject: object,
                targetBucket,
                targetObject: `${targetObject}${targetName}`
            });
        });
    }

    saveFormRef = form => {
        this.form = form;
    }

    loadData = (selectedOptions) => {
        const client = getRegionClient();
        const bucket = selectedOptions[0].value;
        const dataLen = selectedOptions.length;
        const targetOption = selectedOptions[dataLen - 1];
        const prefix = dataLen > 1 ? targetOption.value : '';

        targetOption.loading = true;
        client.listObjects(bucket, {prefix, delimiter: '/'}).then(
            res => {
                targetOption.loading = false;

                if (res.folders.length > 0) {
                    targetOption.children = res.folders.map(folder => ({
                        label: folder.key.replace(/(.*\/)?(.*)\/$/, '$2'),
                        value: folder.key,
                        isLeaf: false
                    }));
                } else {
                    targetOption.isLeaf = true;
                }

                this.setState({
                    buckets: [...this.state.buckets],
                });
            }
        );
    }

    render() {
        const {object, bucket, command, visible, onCancel} = this.props;
        const {buckets} = this.state;

        switch (command) {
        case MENU_COPY_COMMAND: {
            return (
                <Copy ref={this.saveFormRef}
                    visible={visible}
                    bucket={bucket}
                    object={object}
                    buckets={buckets}
                    onCancel={onCancel}
                    onCopy={this.onCopy}
                    loadData={this.loadData}
                />
            );
        }
        case MENU_MOVE_COMMAND: {
            return null;
        }
        case MENU_RENAME_COMMAND: {
            return (
                <Rename ref={this.saveFormRef}
                    visible={visible}
                    object={object}
                    onCancel={onCancel}
                    onCreate={this.onRename}
                />
            );
        }
        default: {
            return null;
        }
        }
    }
}

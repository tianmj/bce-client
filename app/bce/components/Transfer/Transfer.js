/**
 * Component - Transfer Component
 *
 * @file Transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import Header from './Header';
import styles from './Transfer.css';
import UploadItem from './UploadItem';
import DownloadItem from './DownloadItem';
import {TransUploadType, TransDownloadType} from '../../utils/BosType';

export default class Transfer extends Component {
    static propTypes = {
        params: PropTypes.shape({
            transType: PropTypes.string.isRequired
        }),
        uploads: PropTypes.array.isRequired,
        downloads: PropTypes.array.isRequired,
        clearFinish: PropTypes.func.isRequired
    };

    clearFinish() {
        const {clearFinish} = this.props;
        const {transType} = this.props.params;

        return clearFinish(transType);
    }

    createTask() {
    }

    render() {
        const {uploads, downloads} = this.props;
        const {transType} = this.props.params;

        if (transType === TransUploadType) {
            return (
                <div className={styles.container}>
                    <Header
                      createTask={evt => this.createTask(evt)}
                      clearFinish={evt => this.clearFinish(evt)}
                    />
                    <div className={styles.content}>
                        {
                            uploads.map(
                                item => (<UploadItem key={item.uploadId} item={item} />)
                            )
                        }
                        {
                            uploads.length === 0
                            && <span className={`fa fa-cloud-upload ${styles.nocontent}`}>没有上传任务~(&gt;_&lt;)!!!</span>
                        }
                    </div>
                </div>
            );
        } else if (transType === TransDownloadType) {
            return (
                <div className={styles.container}>
                    <Header
                      createTask={evt => this.createTask(evt)}
                      clearFinish={evt => this.clearFinish(evt)}
                    />
                    <div className={styles.content}>
                        {
                            downloads.map(item => (
                                <DownloadItem key={item.path} item={item} />
                            ))
                        }
                        {
                            downloads.length === 0
                            && <span className={`fa fa-cloud-download ${styles.nocontent}`}>没有下载任务~(&gt;_&lt;)!!!</span>
                        }
                    </div>
                </div>
            );
        }
    }
}

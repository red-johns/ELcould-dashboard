// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { stateName as aboutState } from '../../about/state';
import { stateName as clusterState } from '../../cluster/state';
import { stateName as configState } from '../../config/state';
import { stateName as configMapState } from '../../configmap/list/state';
import { stateName as cronJobState } from '../../cronjob/list/state';
import { stateName as daemonSetState } from '../../daemonset/list/state';
import { stateName as deploymentState } from '../../deployment/list/state';
import { stateName as discoveryState } from '../../discovery/state';
import { stateName as ingressState } from '../../ingress/list/state';
import { stateName as jobState } from '../../job/list/state';
import { stateName as namespaceState } from '../../namespace/list/state';
import { stateName as nodeState } from '../../node/list/state';
import { stateName as overviewState } from '../../overview/state';
import { stateName as persistentVolumeState } from '../../persistentvolume/list/state';
import { stateName as persistentVolumeClaimState } from '../../persistentvolumeclaim/list/state';
import { stateName as podState } from '../../pod/list/state';
import { stateName as replicaSetState } from '../../replicaset/list/state';
import { stateName as replicationControllerState } from '../../replicationcontroller/list/state';
import { stateName as secretState } from '../../secret/list/state';
import { stateName as serviceState } from '../../service/list/state';
import { stateName as settingsState } from '../../settings/state';
import { stateName as statefulSetState } from '../../statefulset/list/state';
import { stateName as storageClassState } from '../../storageclass/list/state';
import { stateName as workloadState } from '../../workloads/state';

/**
 * @final
 */
export class NavController {
    /**
     * @param {!./nav_service.NavService} kdNavService
     * @ngInject
     */
    constructor(kdNavService, $resource) {
        /** @private {!./nav_service.NavService} */
        this.kdNavService_ = kdNavService;

        /** @private {!angular.$resource} */
        this.resource_ = $resource;

        /** @export {!Object<string, string>} */
        this.states = {
            'namespace': namespaceState,
            'node': nodeState,
            'workload': workloadState,
            'cluster': clusterState,
            'pod': podState,
            'deployment': deploymentState,
            'replicaSet': replicaSetState,
            'replicationController': replicationControllerState,
            'daemonSet': daemonSetState,
            'persistentVolume': persistentVolumeState,
            'statefulSet': statefulSetState,
            'job': jobState,
            'cronJob': cronJobState,
            'service': serviceState,
            'persistentVolumeClaim': persistentVolumeClaimState,
            'secret': secretState,
            'configMap': configMapState,
            'ingress': ingressState,
            'discovery': discoveryState,
            'config': configState,
            'storageClass': storageClassState,
            'about': aboutState,
            'settings': settingsState,
            'overview': overviewState,
        };

        /**
         * 获取导航菜单
         * @export Array<Object<string, string>>
         */
        this.navGroup = [];

        // 调用获取导航菜单
        this.getNavGroup();
    }

    /**
     * @return {boolean}
     * @export
     */
    isVisible() {
        return this.kdNavService_.isVisible();
    }

    /**
     * Toggles visibility of the navigation component.
     */
    toggle() {
        this.kdNavService_.toggle();
    }

    /**
     * Sets visibility of the navigation component.
     * @param {boolean} isVisible
     * @export
     */
    setVisibility(isVisible) {
        this.kdNavService_.setVisibility(isVisible);
    }

    /**
     * 获取导航菜单
     * @export
     */
    async getNavGroup() {
        // 获取导航菜单与秘钥
        const result_navs = await this.resource_('api/v1/navGroup').get().$promise;
        const result_secret = await this.resource_('api/v1/secret/default').get().$promise;

        /** @type {Array<!backendApi.NavInfo>} */
        const navs = result_navs.navs;
        const secrets = result_secret.secrets;

        // 根据菜单用户名称与秘钥前缀获取token
        if (navs.length > 0 && secrets.length > 0) {
            for (let i = 0; i < navs.length; i++) {
                const serviceaccount = navs[i].serviceaccount;
                for (let j = 0; j < secrets.length; j++) {
                    // 判断前缀
                    if (serviceaccount !== '' && secrets[j].objectMeta.name.indexOf(serviceaccount) === 0) {
                        const result = await this.resource_(`api/v1/secret/default/${secrets[j].objectMeta.name}`).get().$promise;
                        navs[i].url += `?token=${this.decode(result.data.token)}`;
                    }
                }
            }
        }
        this.navGroup = navs;
    }

    // base64 解码
    decode(code) {
        const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;
        let input = code.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        return this._utf8_decode(output);
    }

    _utf8_decode(utftext) {
        let string = "";
        let i = 0;
        let c, c2, c3 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

/**
 * @type {!angular.Component}
 */
export const navComponent = {
    controller: NavController,
    templateUrl: 'chrome/nav/nav.html',
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicePresenter = void 0;
const format_date_1 = require("../../../core/utils/format-date");
class DevicePresenter {
    static toHTTP(device, currentSessionId) {
        return {
            id: device.id.toString(),
            deviceType: device.type,
            location: device.location === 'unknown' ? 'Localização desconhecida' : device.location,
            lastLogin: (0, format_date_1.formatDate)(device.lastLogin),
            browser: device.browser,
            os: device.operatingSystem,
            currentSession: device.id.toString() === currentSessionId
        };
    }
}
exports.DevicePresenter = DevicePresenter;

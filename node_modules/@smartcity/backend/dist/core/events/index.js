"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.DomainEvent = void 0;
const node_events_1 = require("node:events");
var DomainEvent;
(function (DomainEvent) {
    DomainEvent["COMPLAINT_CREATED"] = "complaint.created";
    DomainEvent["COMPLAINT_STATUS_CHANGED"] = "complaint.status_changed";
    DomainEvent["NOTIFICATION_SENT"] = "notification.sent";
    DomainEvent["PAYMENT_COMPLETED"] = "payment.completed";
    DomainEvent["EMERGENCY_REPORTED"] = "emergency.reported";
    DomainEvent["USER_REGISTERED"] = "user.registered";
    DomainEvent["USER_UPDATED"] = "user.updated";
    DomainEvent["APPOINTMENT_BOOKED"] = "appointment.booked";
})(DomainEvent || (exports.DomainEvent = DomainEvent = {}));
const bus = new node_events_1.EventEmitter();
bus.setMaxListeners(100);
exports.eventBus = {
    emit(event, payload) {
        bus.emit(event, payload);
    },
    on(event, listener) {
        bus.on(event, listener);
        return () => bus.off(event, listener);
    },
    once(event, listener) {
        bus.once(event, listener);
    },
};
exports.default = exports.eventBus;
//# sourceMappingURL=index.js.map
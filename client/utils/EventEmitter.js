var subscribers = [];

function Event(eventName, callback) {
    this.eventName = eventName;
    this.callback = callback;
}

Event.prototype.removeListener = function () {
    var index = subscribers.indexOf(this);
    if (index != -1) {
        subscribers.splice(index, 1);
    }
};

var EventEmitter = {
    addListener: function (eventName, callback) {
        var event = new Event(eventName, callback);
        subscribers.push(event);
        return event;
    },
    removeListener: function (event) {
        //event 类型： string || Event || Array
        var rm = function (e) {
            subscribers = subscribers.filter(function (s) {
                return s !== e;
            });
        };

        if (typeof event == 'string') {
            subscribers = subscribers.filter(function (e) {
                return e.eventName !== event;
            });
        } else if (event instanceof Event) {
            rm(event);
        } else if (event instanceof Array) {
            event.forEach(function (e) {
                EventEmitter.removeListener(e);
            });
        }
    },
    dispatch: function (eventName, param) {
        subscribers.forEach(function (event) {
            if (event.eventName === eventName) {
                event.callback && event.callback(param);
            }
        });
    }
};

module.exports = EventEmitter;
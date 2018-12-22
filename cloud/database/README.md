## 数据模型

```javascript
// 拼单状态
const BookingStatus = Object.freeze({
    CREATED: 'created',
    CANCELED: 'canceled',
    DONE: 'done'
});

// 拼单用户
class MpUser {
    // String: openId,
    // String: nickname
    // String: avator
}

// 咖啡选项
class CoffeeOption {
    BaseType: String,
    ExtendOptions: [{ExtendType: String, ExtendOptions: [String]}]
}

// 咖啡选择
class CoffeeChoice {
    // BaseType: String,
    // ExtendChoice: [String]
        // temperature: 冷|热
        // suger: 无糖|半份糖|双份糖
        // milk: 无奶|单份奶|双份奶
}

// 一次拼单
class Booking {
    // date: String,
    // deadline: Date,
    // participants: Array, // [{MpUser: user, CoffeeOption: option, isOwner: Boolean}]
    // status: BookingStatus,
};
```
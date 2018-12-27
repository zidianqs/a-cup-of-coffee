const EventEmitter = require('../../utils/EventEmitter');
const regeneratorRuntime = require('../../utils/runtime');
const DEFAULT_EVENT_TYPE = 'COFFEE_CONFIRMED';

Page({
    data: {
        param: null,
        // 一级选项
        coffeeOptions: [],
        coffeeIndex: 0,
        // 联动的二级选项
        subOptions: [],
        globalCoffeeOptions: [],
        loadingStatus: {
            loading: true,
            btnDisabled: true
        }
    },
    async getCoffeeOptions() {
        const db = wx.cloud.database();
        const collection = db.collection('CoffeeOption');
        try {
            return await collection.get();
        } catch(e) {
            return {
                title: errMsg,
                icon: 'none'
            };
        }
    },

    bindCoffeeChange(evt) {
        const {detail} = evt;
        // 选择的咖啡类型
        const type = parseInt(detail.value, 10) || 0;
        const subOptions = this.data.globalCoffeeOptions[type];

        this.setData({
            coffeeIndex: type,
            subOptions
        });
    },

    bindCoffeeSubOptionChange(evt) {
        const {target, detail} = evt;
        const value = parseInt(detail.value, 10) || 0;
        const {dataset={}} = target;
        const {group=0} = dataset;

        const subOptions = this.data.subOptions;
        subOptions[group].selected = value;
        this.setData({
            subOptions: [...subOptions]
        });
    },

    bindSelectDone() {
        const data = this.data;
        const event = data.param && data.param.eventType || DEFAULT_EVENT_TYPE;
        const baseType = data.coffeeOptions[data.coffeeIndex];
        const extendType = data.subOptions.map(option => option.list[option.selected]).join(',');

        console.log(`${baseType} ${extendType}`);
        EventEmitter.dispatch(event, `${baseType} ${extendType}`);
        wx.navigateBack();
    },

    onLoad(param) {
        this.setData({
            param
        });
    },

    onReady() {
        this.getCoffeeOptions().then(result => {
            if(!result.data) {
                return Promise.reject(result);
            }
            const list = result.data;
            // 保存二级选项
            const globalCoffeeOptions = list.map(({ExtendOptions}) => {
                return ExtendOptions.map(option => {
                    return {
                        title: option.ExtendType,
                        list: option.ExtendOptions,
                        selected: option.ExtendOptions.findIndex(opt => (opt === option.ExtendDefaultOption))
                    };
                });
            });

            this.setData({
                coffeeOptions: list.map(coffee => coffee.BaseType),
                globalCoffeeOptions: globalCoffeeOptions,
                subOptions: globalCoffeeOptions[0] || [],
                coffeeIndex: 0,
                loadingStatus: {
                    loading: false,
                    btnDisabled: false
                }
            });
        }).catch(err => {
            console.log(err);
            wx.showToast(err);
        });
    }
});
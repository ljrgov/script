// 此脚本用于过滤滴滴出行的部分内容
// Surge 5 script

const url = $request.url;
if (!$response.body) $done({});

let obj = JSON.parse($response.body);

// 处理开屏广告，startup/ad可替换为广告接口关键字
if (url.includes("/startup/ad")) {
  if (obj.data) {
    obj.data = {};
  }
}

// 过滤优惠商城
if (url.includes("/other/pGetSceneList")) {
  if (obj && obj.data && obj.data.scene_list instanceof Array) {
    obj.data.scene_list = obj.data.scene_list.filter(item => item.text !== "优惠商城");
  }
  if (obj && obj.data && obj.data.show_data instanceof Array) {
    obj.data.show_data.forEach((block) => {
      if (block.scene_ids instanceof Array) {
        block.scene_ids = block.scene_ids.filter(id => id !== "scene_coupon_mall");
      }
    });
  }
}

// 首页导航和底部导航过滤
if (url.includes("/homepage/v1/core")) {
  const keepNavIds = ['dache_anycar', 'driverservice', 'bike'];
  if (obj.data && obj.data.order_cards && obj.data.order_cards.nav_list_card && obj.data.order_cards.nav_list_card.data) {
    obj.data.order_cards.nav_list_card.data = obj.data.order_cards.nav_list_card.data.filter(item => keepNavIds.includes(item.nav_id));
  }
  const keepBottomNavIds = ['v6x_home', 'user_center'];
  if (obj.data && obj.data.disorder_cards && obj.data.disorder_cards.bottom_nav_list && obj.data.disorder_cards.bottom_nav_list.data) {
    obj.data.disorder_cards.bottom_nav_list.data = obj.data.disorder_cards.bottom_nav_list.data.filter(item => keepBottomNavIds.includes(item.id));
  }
}

// 去除顶横幅广告
if (url.includes("/ota/na/yuantu/infoList")) {
  if (obj.data && obj.data.disorder_cards && obj.data.disorder_cards.top_banner_card && obj.data.disorder_cards.top_banner_card.data && obj.data.disorder_cards.top_banner_card.data[0] && obj.data.disorder_cards.top_banner_card.data[0].T === "yuentu_top_banner") {
    obj.data.disorder_cards.top_banner_card.data.splice(0, 1);
  }
}

// 用户中心过滤
if (url.includes("/usercenter/me")) {
  const excludedTitles = ['天天领福利', '金融服务', '更多服务', '企业服务', '安全中心'];
  if (obj.data && obj.data.cards) {
    obj.data.cards = obj.data.cards.filter(card => !excludedTitles.includes(card.title));
    obj.data.cards.forEach(card => {
      if (card.tag === "wallet") {
        if (card.items) {
          card.items = card.items.filter(item => item.title === "优惠券");
        }
        if (card.card_type === 4 && card.bottom_items) {
          card.bottom_items = card.bottom_items.filter(item => item.title === "省钱套餐" || item.title === "天天神券");
        }
      }
    });
  }
}

// 去除无关数据
if (url.includes("/resapi/activity/mget") || 
    url.includes("/dynamic/conf") || 
    url.includes("/homepage/v1/other/fast") || 
    url.includes("/agent/v3/feeds") || 
    url.includes("/resapi/activity/xpget") || 
    url.includes("/gateway")) {
  delete obj.data;
}

// 清除多余广告
const adKeys = ['advertisements', 'ad_list', 'ads', 'banners'];
adKeys.forEach(key => {
  if (obj.data && obj.data[key]) {
    delete obj.data[key];
  }
  if (obj[key]) {
    delete obj[key];
  }
});

$done({ body: JSON.stringify(obj) });
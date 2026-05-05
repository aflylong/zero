const tabList = [
  {
    key: "today",
    text: "今日",
    pagePath: "pages/today/index",
    url: "/pages/today/index",
    icon: "today",
  },
  {
    key: "path",
    text: "道路",
    pagePath: "pages/path/index",
    url: "/pages/path/index",
    icon: "path",
  },
  {
    key: "records",
    text: "记录",
    pagePath: "pages/records/index",
    url: "/pages/records/index",
    icon: "records",
  },
  {
    key: "identity",
    text: "身份",
    pagePath: "pages/identity/index",
    url: "/pages/identity/index",
    icon: "identity",
  },
];

Component({
  data: {
    selected: 0,
    tabs: tabList,
  },
  lifetimes: {
    attached() {
      this.syncSelected();
    },
  },
  pageLifetimes: {
    show() {
      this.syncSelected();
    },
  },
  methods: {
    syncSelected() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage?.route ?? "";
      const selected = tabList.findIndex((item) => item.pagePath === currentRoute);
      this.setData({
        selected: selected >= 0 ? selected : 0,
      });
    },
    switchTab(event) {
      const index = event.currentTarget.dataset.index;
      const url = event.currentTarget.dataset.url;
      if (typeof index !== "number" || !url) {
        return;
      }

      if (index === this.data.selected) {
        return;
      }

      wx.switchTab({ url });
    },
  },
});

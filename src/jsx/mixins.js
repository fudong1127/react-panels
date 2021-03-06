
var Mixins = {
  Styleable: {
    getInitialState: function () {
      this.__ssv = {};
      this.__ssvh = false;
      this.__ssa = {target: '', mods: [], alter: {}};
      return {};
    },
    contextTypes: {
      sheet: React.PropTypes.func
    },
    getSheet: function (target, mods, alter) {
      var rebuild = false, i;

      mods = (typeof this['getSheetMods'] === "function") ? this['getSheetMods'](mods || []) : mods || [];
      alter = alter || {}
      if (target != this.__ssa.target) rebuild = true;
      else {
        if (mods.length != this.__ssa.mods.length) rebuild = true;
        else if (mods.length != 0) {
          for (i = mods.length; --i >= 0;) {
            if (this.__ssa.mods.indexOf(mods[i]) == -1) {
              rebuild = true;
              break;
            }
          }
        }
        // TODO: check if alter has changed
      }

      if (rebuild) {
        this.__ssv = this.context.sheet(target, mods, alter);
        this.__ssvh = false;
        this.__ssa = {
          target: target,
          mods: Utils.merge(mods, []),
          alter: Utils.merge(alter, {})
        };
      }
      if ((typeof this.state._hover === "boolean")) {
        if (this.state._hover) {
          if (this.__ssvh || false) {
            return this.__ssvh;
          }
          if ((this.__ssv.state || false) && (this.__ssv.state.hover || false)) {
            this.__ssvh = Utils.merge(this.__ssv, this.__ssv.state.hover);
            return this.__ssvh;
          }
        }
      }

      return this.__ssv;
    }
  },
  Toolbar: {
    getDefaultProps: function () {
      return {
        panelComponentType: "Toolbar"
      };
    }
  },
  Content: {
    getDefaultProps: function () {
      return {
        panelComponentType: "Content"
      };
    }
  },
  Footer: {
    getDefaultProps: function () {
      return {
        panelComponentType: "Footer"
      };
    }
  }
};

Mixins.StyleableWithEvents = {
  mixins: [Mixins.Styleable],

  getDefaultProps: function () {
    return {
      onMouseEnter: false,
      onMouseLeave: false
    };
  },

  getInitialState: function () {
    this.listeners = {
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave
    };
    return {
      _hover: false,
      _focus: false
    };
  },

  handleMouseEnter: function (ev) {
    if (typeof this.props['onMouseEnter'] === "function") this.props['onMouseEnter'](ev);

    this.setState({
      _hover: true
    });
  },

  handleMouseLeave: function (ev) {
    if (typeof this.props['onMouseLeave'] === "function") this.props['onMouseLeave'](ev);

    this.setState({
      _hover: false
    });
  }

};

Mixins.PanelWrapper = {

  getDefaultProps: function () {
    return {
      "icon": false,
      "title": "",
      "selectedIndex": 0,
      /** Triggered before a change tab event propagated from within the Panel (e.g., user's click).
       *  Optionally, return false to stop it.
       */
      "onTabChange": null,
      "buttons": []
    };
  },

  getInitialState: function () {
    var opts = {
      theme: this.props.theme,
      skin: this.props.skin,
      headerHeight: this.props.headerHeight,
      headerFontSize: this.props.headerFontSize,
      borderRadius: this.props.borderRadius,
      maxTitleWidth: this.props.maxTitleWidth
    };
    this._sheet = createSheet(opts);
    return {
      selectedIndex: parseInt(this.props.selectedIndex)
    };
  },

  childContextTypes: {
    selectedIndex: React.PropTypes.number,
    sheet: React.PropTypes.func,
    onTabChange: React.PropTypes.func
  },

  getChildContext: function () {
    return {
      selectedIndex: this.state.selectedIndex,
      sheet: this._sheet,
      onTabChange: this.handleTabChange
    };
  },

  handleTabChange: function (index) {
    if (typeof this.props.onTabChange === "function") {
      if (this.props.onTabChange(index, this) !== false) {
        this.setSelectedIndex(index);
      }
    } else {
      this.setSelectedIndex(index);
    }
  },

  getSelectedIndex: function () {
    return this.state.selectedIndex;
  },

  setSelectedIndex: function (index) {
    this.setState({selectedIndex: parseInt(index)});
    this.forceUpdate();
  },

  componentWillReceiveProps: function (nextProps) {
    if (typeof nextProps.selectedIndex !== "undefined") {
      if (nextProps.selectedIndex != this.props.selectedIndex) {
        this.setSelectedIndex(nextProps.selectedIndex);
      }
    }
  }

};

Mixins.TabWrapper = {
  observedProps: ['selectedIndex', 'index'],

  getDefaultProps: function () {
    return {
      panelComponentType: "TabWrapper",
      icon: "",
      title: "",
      pinned: false,
      showToolbar: true
    };
  },

  childContextTypes: {
    index: React.PropTypes.number
  },

  getChildContext: function () {
    return {
      index: this.props.index
    };
  },

  contextTypes: {
    selectedIndex: React.PropTypes.number
  }

};

Mixins.Button = {
  mixins: [Mixins.StyleableWithEvents],

  getDefaultProps: function () {
    return {
      name: "default",
      title: "",
      visible: true,
      enabled: true,
      active: false,
      onClick: false,
      onDoubleClick: false,
      onContextMenu: false,
      onChange: false
    };
  },

  getInitialState: function () {
    this.listeners.onClick = this._handleClick;
    this.listeners.onDoubleClick = this._handleDoubleClick;
    this.listeners.onContextMenu = this._handleContextMenu;
    return {
      visible: this.props.visible,
      enabled: this.props.enabled,
      active: this.props.active
    };
  },

  childContextTypes: {
    btnTitle: React.PropTypes.string,
    btnVisible: React.PropTypes.bool,
    btnEnabled: React.PropTypes.bool,
    btnActive: React.PropTypes.bool
  },

  getChildContext: function () {
    return {
      btnTitle: this.props.title,
      btnVisible: this.state.visible,
      btnEnabled: this.state.enabled,
      btnActive: this.state.active
    };
  },

  contextTypes: {
    selectedIndex: React.PropTypes.number
  },

  getSheetMods: function (otherMods) {
    var mods = otherMods || [];   //np
    if (this.state.active && mods.indexOf('active') == -1) mods.push('active');
    if (!this.state.visible && mods.indexOf('hidden') == -1) mods.push('hidden');
    if (!this.state.enabled && mods.indexOf('disabled') == -1) mods.push('disabled');

    return mods;
  },

  _handleDoubleClick: function (ev) {
    if (typeof this.props.onDoubleClick === "function" && this.props.onDoubleClick(ev, this) === false) return;

    if (typeof this['handleDoubleClick'] === "function") {
      return this['handleDoubleClick'](ev);
    }
  },

  _handleClick: function (ev) {
    if (typeof this.props.onClick === "function" && this.props.onClick(ev, this) === false) return;

    if (typeof this['handleClick'] === "function") {
      return this['handleClick'](ev);
    }
  },

  _handleContextMenu: function (ev) {
    if (typeof this.props.onContextMenu === "function" && this.props.onContextMenu(ev, this) === false) return;

    if (typeof this['handleContextMenu'] === "function") {
      return this['handleContextMenu'](ev);
    }
  }

};

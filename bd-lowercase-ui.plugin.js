/**
 * @name lowercase ui plugin
 * @author thornling
 * @version 0.1.1
 * @description lowercase discord ui plugin with more options
 * @source https://github.com/thornling/lowercase-ui-plugin
 * @updateUrl https://raw.githubusercontent.com/thornling/lowercase-ui-plugin/refs/heads/main/bd-lowercase-ui.plugin.js
 * @note adds toggles to lowercase ui theme https://github.com/thornling/lowercase-ui-for-betterdiscord
 */

module.exports = class LowercaseUI {
    constructor() {
        this.pluginId = "lowercaseUI";
        this.defaultSettings = {
            messages: true,
            users: true,
            servers: true,
            allExceptions: false
        };
        this.settings = BdApi.loadData(this.pluginId, "settings") ?? { ...this.defaultSettings };

        this.labels = {
            messages: "messages",
            users: "users",
            servers: "servers",
            all: "all of the above"
        };
        this.descriptions = {
            messages: "original chat content",
            users: "original usernames and nicknames",
            servers: "original server and channel text",
            all: "original server info, user info, and message content"
        };
    }

    getName() { return "lowercase ui"; }
    getDescription() { return "lowercase discord ui with exception toggles"; }
    getVersion() { return "0.1.0"; }
    getAuthor() { return "thornling"; }

    load() {}
    start() { this.applyCSS(); }
    stop() { BdApi.clearCSS(this.pluginId); }
    save() { BdApi.saveData(this.pluginId, "settings", this.settings); }

    applyCSS() {
        let css = "";

        css += this.cssUI();
        css += this.cssExceptionsFunctional();

        css += `
          /* base option */
          .lc-option {
              display: flex;
              flex-direction: column;
              gap: 2px;
              padding: 8px;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
              color: var(--text-primary) !important;
              background-color: rgba(0, 0, 0, 0.1);
          }

          /* option states */
          .lc-option:hover {
              background-color: var(--background-modifier-hover);
          }
          .lc-option[data-lc-selected="true"],
          .lc-settings-panel:has(.lc-option[data-lc-all="true"][data-lc-selected="true"]) .lc-option {
              background-color: var(--background-modifier-selected);
          }

          /* option text */
          .lc-option [data-lc-label] {
              font-size: 14px !important;
              font-weight: 500;
          }
          .lc-option [data-lc-desc] {
              font-size: 12px !important;
              opacity: 0.9;
          }

          /* preview container */
          .lc-preview {
              display: flex;
              flex-direction: row;
              align-items: center;
              width: 100%;
              box-sizing: border-box;
              padding: 0 16px;
              height: 58px;
          }
          .lc-preview:first-of-type {
              margin-top: 36px;
          }

          .lc-preview [data-lc-label="servers"] {
              font-size: 14px;
              font-weight: 600;
              line-height: 20px;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: var(--text-primary);
          }
          .lc-preview img {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              flex-shrink: 0;
          }
          .lc-preview [data-lc-label="users"] {
              font-weight: 600;
              font-size: 14px;
              color: var(--text-primary);
          }
          .lc-preview .timestamp_c19a55 {
              font-size: 12px;
              color: var(--text-muted);
          }
          .lc-preview [data-lc-desc="messages"] {
              color: var(--text-primary);
          }

          /* settings panel */
          .lc-settings-panel {
              display: inline-flex;
              flex-direction: column;
              align-items: stretch;
              width: max-content;
              gap: 12px;
          }
          .lc-settings-panel[data-lc-all-active="true"] .lc-option:not([data-lc-all="true"]) {
              opacity: 0.5;
              pointer-events: none;
          }
          .lc-settings-panel[data-lc-all-active="true"] .lc-option:not([data-lc-all="true"]):hover {
              background-color: inherit;
          }
          .lc-settings-panel h3 {
              color: var(--header-primary) !important;
              margin-bottom: 4px;
          }

          /* modal overrides */
          .bd-modal-header {
              justify-content: flex-start !important;
              padding-left: 16px;
          }
          .bd-modal-header h1 {
              margin: 0;
              color: var(--header-primary) !important;
          }
          .bd-modal-content {
              padding-top: 0 !important;
              padding-left: 6px !important;
          }
        `;

        if (this.settings.allExceptions) {
            css += this.cssExceptionsMessages();
            css += this.cssExceptionsUsers();
            css += this.cssExceptionsServers();
            css += `
              [class*="chatContent"] .input__0f084::placeholder {
                  text-transform: none !important;
              }
              .wrapper__3412a .input__0f084::placeholder {
                  text-transform: lowercase !important;
              }
            `;
        } else {
            if (this.settings.messages) {
                css += this.cssExceptionsMessages();
                css += `
                  [class*="chatContent"] .input__0f084::placeholder {
                      text-transform: none !important;
                  }
                  .wrapper__3412a .input__0f084::placeholder {
                      text-transform: lowercase !important;
                  }
                `;
            }
            if (this.settings.users) css += this.cssExceptionsUsers();
            if (this.settings.servers) css += this.cssExceptionsServers();
        }

        BdApi.clearCSS(this.pluginId);
        BdApi.injectCSS(this.pluginId, css);
    }

    getSettingsPanel() {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "row";
        container.style.gap = "24px";

        const panel = document.createElement("div");
        panel.className = "lc-settings-panel";
        panel.style.display = "flex";
        panel.style.flexDirection = "column";
        panel.style.gap = "12px";
        panel.style.padding = "0 12px 12px 12px";

        if (this.settings.allExceptions) {
            panel.setAttribute("data-lc-all-active", "true");
        }

        const header = document.createElement("h3");
        header.textContent = "exceptions";
        panel.appendChild(header);

        const makeOption = (key, labelKey, descKey, isAll = false) => {
            const wrapper = document.createElement("div");
            wrapper.className = "lc-option";
            if (isAll) wrapper.setAttribute("data-lc-all", "true");

            const isActive = isAll ? this.settings.allExceptions : this.settings[key];
            wrapper.setAttribute("data-lc-selected", isActive ? "true" : "false");

            const title = document.createElement("span");
            title.setAttribute("data-lc-label", labelKey);
            title.textContent = this.labels[labelKey];

            const desc = document.createElement("span");
            desc.setAttribute("data-lc-desc", descKey);
            desc.textContent = this.descriptions[descKey];

            wrapper.appendChild(title);
            wrapper.appendChild(desc);

            wrapper.onclick = () => {
                if (isAll) {
                    const newState = !this.settings.allExceptions;
                    this.settings.allExceptions = newState;
                    this.settings.messages = newState;
                    this.settings.users = newState;
                    this.settings.servers = newState;
                } else {
                    if (this.settings.allExceptions) return;
                    this.settings[key] = !this.settings[key];
                }
                this.save();
                this.applyCSS();
                const parent = container.parentElement;
                if (parent) parent.replaceChild(this.getSettingsPanel(), container);
            };

            return wrapper;
        };

        panel.appendChild(makeOption("servers", "servers", "servers"));
        panel.appendChild(makeOption("users", "users", "users"));
        panel.appendChild(makeOption("messages", "messages", "messages"));
        panel.appendChild(makeOption("allExceptions", "all", "all", true));

        const preview = document.createElement("div");
        preview.style.flex = "1";
        preview.style.display = "flex";
        preview.style.flexDirection = "column";
        preview.style.gap = "12px";

        // server preview
        const serverPreview = document.createElement("div");
        serverPreview.className = "lc-option lc-preview";
        serverPreview.style.pointerEvents = "none";
        serverPreview.style.background = "var(--background-base-lowest)";

        const serverLabel = document.createElement("span");
        serverLabel.setAttribute("data-lc-label", "servers");
        serverLabel.textContent = "Discord Server";

        const dropdown = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        dropdown.setAttribute("width", "18");
        dropdown.setAttribute("height", "18");
        dropdown.setAttribute("viewBox", "0 0 24 24");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("fill", "currentColor");
        path.setAttribute("d", "M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z");
        dropdown.appendChild(path);

        serverPreview.appendChild(serverLabel);
        serverPreview.appendChild(dropdown);

        // message preview
        const messagePreview = document.createElement("div");
        messagePreview.className = "lc-option lc-preview";
        messagePreview.style.pointerEvents = "none";
        messagePreview.style.background = "var(--background-base-lowest)";

        const avatar = document.createElement("img");
        avatar.src = "https://cdn.discordapp.com/embed/avatars/0.png";
        avatar.alt = "default avatar";

        const textBlock = document.createElement("div");
        textBlock.style.display = "flex";
        textBlock.style.flexDirection = "column";

        const headerRow = document.createElement("div");
        headerRow.style.display = "flex";
        headerRow.style.alignItems = "baseline";
        headerRow.style.gap = "4px";

        const username = document.createElement("span");
        username.setAttribute("data-lc-label", "users");
        username.textContent = "User";

        const now = new Date();
        const display = now.toLocaleString([], {
            month: "numeric", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true
        });
        const full = now.toLocaleString([], {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true
        });

        const timestampSpan = document.createElement("span");
        timestampSpan.className = "timestamp_c19a55 timestampInline_c19a55";

        const timeEl = document.createElement("time");
        timeEl.dateTime = now.toISOString();
        timeEl.innerHTML = `<i class="separator_c19a55" aria-hidden="true"> — </i>${display}`;

        const hidden = document.createElement("span");
        hidden.className = "hiddenVisually_b18fe2";
        hidden.textContent = full;

        timestampSpan.appendChild(timeEl);
        timestampSpan.appendChild(hidden);

        headerRow.appendChild(username);
        headerRow.appendChild(timestampSpan);

        const messageText = document.createElement("div");
        messageText.setAttribute("data-lc-desc", "messages");
        messageText.textContent = "Hello";

        textBlock.appendChild(headerRow);
        textBlock.appendChild(messageText);

        messagePreview.appendChild(avatar);
        messagePreview.appendChild(textBlock);

        preview.appendChild(serverPreview);
        preview.appendChild(messagePreview);

        container.appendChild(panel);
        container.appendChild(preview);

        return container;
    }

    applyTextTransform(node, type) {
        const active = this.settings[type] || this.settings.allExceptions;
        node.style.textTransform = active ? "" : "lowercase";
    }

    cssUI() {
        return `
/* app layout */
[class^="app-"],
[class^="layers-"],
[class^="container-"],
[class^="content-"],
[class^="sidebar-"],
[class^="toolbar-"],

/* headings + titles */
h1, h2, h3, h4, h5, h6,
[class^="header-"],
[class^="title-"],
[class^="subtitle-"],
[class*="heading"],
[class*="sectionTitle"],
[class*="groupHeader"],

/* dm list */
[class*="privateChannelsHeaderContainer"],
[class*="privateChannels"] [class*="name"],
[class*="privateChannels"] [class*="channel"],
.friendsButtonContainer__35e86 .name__20a53,
.friendsButtonContainer__35e86 .overflow__82b15,

/* forms + labels */
label,
[class^="label-"],
[class^="form-"],
[class^="settings-"],
[class*="settingItemName"],
[class*="settingItemDescription"],
[class*="fieldTitle"],
[class*="legend"],
[class*="subtext"],
[class*="helperText"],
[class*="labelContainer"],
[class*="description"],

/* text variants */
[class*="text-md"][class*="semibold"],
[class*="text-md"][class*="medium"],
[class*="text-sm"][class*="semibold"],
[class*="text-xs"][class*="semibold"],
[class*="text-xs"][class*="normal"],
[class*="text__0d0f9"],
[class*="text__35859"],
[class*="eyebrow"],
[data-text-variant="eyebrow"],

/* misc info */
.colorSwatchLabel__04485,
.info__88a69,

/* menus + navigation */
[class*="menu"],
[class*="contextMenu"],
[class*="tabBar"],
[class*="tabBarItem"],
[class*="guildTabBarItem"],

/* inputs + buttons */
input::placeholder,
[class*="input"],
button,
select,
[role="button"],
[class*="button"],
[class*="btn"],
[class*="cta"],
[class*="pill"],
[class*="chip"],
[class*="segmented"],
[class*="switch"],
[class*="toggle"],
[class*="radio"],
[class*="checkbox"],
[class*="contents"],
[class*="colorBrand"],
[class*="sizeSmall"],
[class*="grow"],

/* containers + panels */
[class*="modal"],
[class*="popout"],
[class*="panel"],
[class*="card"],

/* scroll + notices */
[class*="scroller"],
[class*="notice"],
[class*="toast"],
[class*="breadcrumb"],
[class*="keybind"],

/* tooltips */
[class*="tooltip"],
[role="tooltip"],

/* form text + notices */
[class*="formText"],
[class*="formNoticeBody"],
[class*="giftText"],
[class*="keybindMessage"],

/* keybinds */
[class*="defaultKeybindGroup"],
[class*="defaultKeybind"],
[class*="defaultKeybindShortcutGroup"],
[class*="combo"],
[class*="key"],

/* game info */
[class*="gameName"],
[class*="lastPlayed"],

/* search results */
[class*="resultsGroup"] [class*="header"],
[class*="resultsGroup"] [class*="headerText"],

/* expression picker */
[class*="headerLabel"],
[class*="categoryLabel"],
[class*="guildSectionLabel"],

/* system banners + jump bar */
[class*="jumpToPresentBar"],
[class*="barButtonMain"],
[class*="lineClamp1"],
[class*="messagesWrapper"] [class*="eyebrow"],

/* search bar headers */
[class*="searchBar"] [class*="headerText"],

/* betterdiscord */
.bd-text-normal {
  text-transform: lowercase !important;
}
        `;
    }

    cssExceptionsFunctional() {
        return `
/* typed input */
[role="textbox"][class*="slateTextArea"],
[role="textbox"][class*="textArea"],
.textarea__9daae,
.searchBar__97492 .public-DraftEditor-content,
input.input__0f084[type="text"],
textarea.textArea__5a092,
input.input_ac6cb0[type="text"],

/* emoji + stickers */
[class*="autocompleteRowHeading"],
[class*="emojiName"],
[class*="stickerNode"][aria-label],
[class*="stickerAsset"][alt],
div.wrapper__14245 > span.headerLabel__14245[class*="headerLabel"],
button.emojiItem_fc7141.emojiItemMedium_fc7141[data-name][data-type="emoji"],

/* tooltips + containers */
[class*="reactionTooltip"],
.wrapper__3412a,

/* inspector titles */
[class*="titlePrimary"][class*="text-md"][class*="semibold"],
[class*="titleSecondary"][class*="text-xs"][class*="normal"] {
  text-transform: none !important;
}
        `;
    }

    cssExceptionsServers() {
        return `
:where(
  [class*="guildName"],
  [class*="serverName"],
  [class*="channelName"],
  [class*="threadName"],
  [class*="categoryName"],
  [class*="threadsHeader"],
  [class*="topic"],
  .eventName_e2d7b8
),
[data-lc-label="servers"],

/* titlebar */
[class*="defaultColor"][data-text-variant],
[class*="lineClamp"][data-text-variant],

/* sidebar */
nav.container__2637a[aria-label][aria-label*="server"] h2,
nav.container__2637a[aria-label][aria-label*="server"] .name_f37cb1,
nav.container__2637a[aria-label][aria-label*="server"] .name__2ea32:not([aria-hidden="true"]),
nav.container__2637a[aria-label][aria-label*="server"] .name__29444,
nav.container__2637a[aria-label][aria-label*="server"] .overflow__82b15,

/* channel intro popup */
.modal_ca6911 .header_ca6911 .text-md\\/semibold_cf4812,
.modal_ca6911 .content_ca6911.markup__75297,

/* member groups */
.membersGroup_c8ffbb.container__13cf1.header__13cf1,

/* soundboard */
.sectionHeader__61424 .sectionTitle__61424,

/* server folder tooltip */
.tooltipContent_c36707 {
  text-transform: none !important;
}
        `;
    }

    cssExceptionsUsers() {
        return `
/* identity */
[class*="username"],
[class*="userTag"],
[class*="nameTag"],
[class*="title-"],
[class*="discriminator"],
[data-user-id],
[data-lc-label="users"] {
  text-transform: none !important;
}

/* popouts + profiles */
[class*="userPopout"],
[class*="profileCard"],
.profileBio .markup__75297,
.aboutMeSection__63ed3,
[class*="activityText"],
.placeholder__1b31f,
[data-slate-placeholder="true"],
.tagText__10651,
.guildTag__63ed3,
.accountNameText__9bfb9,
.accountName__9bfb9,
.tag__89036 {
  text-transform: none !important;
}

/* message headers */
[class*="message"] [class*="header"] [class*="username"],
[class*="message"] [class*="header"] [class*="nameTag"] {
  text-transform: none !important;
}

/* dm header title + display name */
.titleWrapper__9293f h1[data-text-variant],
.titleWrapper__9293f h1 [aria-label],
.titleWrapper__9293f h1 > div {
  text-transform: none !important;
}

/* dm list usernames + nicknames */
ul[aria-label="Direct Messages"] li.dm__972a0 .name__20a53,
ul[aria-label="Direct Messages"] li.dm__972a0 .overflow__82b15,
ul[aria-label="Direct Messages"] li.dm__972a0 [aria-label*="(direct message)"] .name__20a53 {
  text-transform: none !important;
}

/* bio text variants */
section.markup__75297 [data-text-variant] {
  text-transform: none !important;
}

/* member list */
[class*="memberInner"],
[class*="member"] [class*="name"],
[class*="member"] [class*="username"] {
  text-transform: none !important;
}
        `;
    }


    cssExceptionsMessages() {
        return `
:where(
  [role="article"], [class*="message"], [class*="markup"],
  [class*="attachment"], [class*="spoilerText"], [class*="repliedText"],
  [class*="threadMessage"], [class*="threadContent"]
),
[data-lc-desc="messages"] {
  text-transform: none !important;
}
        `;
    }

}

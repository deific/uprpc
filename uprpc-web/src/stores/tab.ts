import {makeAutoObservable} from "mobx";
import {Tab, TabType} from "@/types/types";

export default class TabStore {
    constructor() {
        console.log('init tab store')
        makeAutoObservable(this)
    }

    selectedTab = '1';
    openTabs: Tab[] = [];

    selectTab(key: string) {
        this.selectedTab = key;
    }

    setDot(key: string) {
        this.openTabs.forEach((item, index) => {
            if (item.key == key) {
                item.dot = true;
                this.openTabs.splice(index, 1, item);
            }
        })
    }

    openTab(tab: Tab) {
        if (this.openTabs.length == 1 && this.openTabs[0].key === '1') {
            this.openTabs.splice(0, 1);
        }

        let index = this.openTabs.findIndex((value) => value.key === tab.key);
        if (index == -1) {
            this.openTabs.push(tab)
        }

        this.selectedTab = tab.key
    }

    remove(key: any) {
        if (this.openTabs.length == 1) return;
        this.openTabs.forEach((item, index) => {
            if (item.key == key) {
                this.openTabs.splice(index, 1);
                let pos = index < this.openTabs.length ? index : this.openTabs.length - 1;
                this.selectedTab = this.openTabs[pos].key
            }
        })
    }
}
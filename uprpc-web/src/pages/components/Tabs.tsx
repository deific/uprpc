import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import {Badge, Button, Select, Space, Tabs} from "antd";
import "allotment/dist/style.css";
import Editor from "@/pages/components/Editor";
import {EyeOutlined} from "@ant-design/icons";
import {context} from '@/stores/context'
import {TabType} from "@/types/types";
import Welcome from "@/pages/components/Welcome";

const tabs = () => {
    let {tabStore} = useContext(context)
    const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        tabStore.remove(targetKey)
    };

    const extra = <Space size={0} style={{marginRight: 10}}>
        <Select defaultValue="1" style={{width: 180}} bordered={false}>
            <Select.Option value="1">No Environment</Select.Option>
            <Select.Option value="2">Lucy</Select.Option>
        </Select>
        <Button type='text' icon={<EyeOutlined/>} size="large"/>
    </Space>;

    if (tabStore.openTabs.length == 0) {
        return <Welcome/>
    }

    return (
        <Tabs hideAdd type="editable-card" onEdit={onEdit} style={{height: "100%"}} size='small'
                  onTabClick={(key: string) => tabStore.selectTab(key)}
                  activeKey={tabStore.selectedTab}
                  tabBarExtraContent={extra}>
        {tabStore.openTabs.map((value) => {
            return (<Tabs.TabPane
                closable={value.closable}
                tab={<Badge dot={value.dot} offset={[5, 8]}>{value.title}</Badge>}
                key={value.key}
                style={{height: "100%"}}>
                {value.type == TabType.Welcome ? <Welcome/> : ''}
                {value.type == TabType.Proto ? <Editor pos={value.params}/> : ''}
            </Tabs.TabPane>)
        })}
    </Tabs>)
}

export default observer(tabs)
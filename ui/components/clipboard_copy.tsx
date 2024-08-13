import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";





export function CopyToClipboard(props: { text: string, onCopy: () => void, size?: number }) {
    const [is_copied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(props.text).then(() => {
            props.onCopy();
            setIsCopied(true);
        });
    }

    let button_icon = <CopyOutlined />;
    if (is_copied) {
        button_icon = <CheckOutlined />;
    }


    return (
        <Flex justify="center" align="center" gap={20} style={{ width: '100%' }}>
            <Typography.Text style={{ fontSize: props.size }}>{props.text}</Typography.Text>
            <Button onClick={copyToClipboard} icon={button_icon} size="large" type="text" ></Button>
        </Flex>
    )

}
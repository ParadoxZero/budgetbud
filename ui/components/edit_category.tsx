import React from "react";
import { Button, Input, Flex } from "antd";
import { CloseOutlined, LoadingOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";

export enum EditCategoryState {
  Unfilled,
  Filled,
  Processing,
}

interface EditCategoryProps {
  state: EditCategoryState;
  onAddExpense: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModalRequested: () => void;
  onCloseRequested: () => void;
}

const EditCategory: React.FC<EditCategoryProps> = ({
  state,
  onAddExpense,
  onInputChange,
  onModalRequested,
  onCloseRequested,
}) => {
  let feature_button_icon = <CloseOutlined />;
  if (state === EditCategoryState.Processing) {
    feature_button_icon = <LoadingOutlined />;
  } else if (state === EditCategoryState.Filled) {
    feature_button_icon = <PlusOutlined />;
  }

  const handle_action_button_click = () => {
    if (state === EditCategoryState.Filled) {
      onAddExpense();
    } else if (state === EditCategoryState.Unfilled) {
      onCloseRequested();
    }
  };

  return (
    <div
      style={{
        margin: 0,
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 20,
        paddingLeft: 20,
        minWidth: 300,
      }}
      className="touchahble"
    >
      <Flex align="center" justify="space-between" style={{ minHeight: 80 }}>
        <Input
          id="expense_amount"
          size="large"
          type="number"
          placeholder="Spent amount"
          autoFocus
          variant="borderless"
          minLength={250}
          inputMode="numeric"
          style={{ padding: 0 }}
          onPressEnter={handle_action_button_click}
          onInput={onInputChange}
          disabled={state === EditCategoryState.Processing}
        />
        <Flex align="center" justify="right">
          <Button
            shape="circle"
            type="default"
            icon={feature_button_icon}
            style={{ padding: 20, marginLeft: 20 }}
            onClick={handle_action_button_click}
          ></Button>
          <Button
            shape="circle"
            type="default"
            icon={<RightOutlined />}
            style={{ padding: 20, marginLeft: 20 }}
            onClick={onModalRequested}
          ></Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default EditCategory;

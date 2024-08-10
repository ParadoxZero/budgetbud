import { Button, Card, Empty, Flex, Form, FormInstance, Input, InputNumber } from "antd";
import React from "react";
import { Budget, Category, DataModelFactory } from "../datamodel/datamodel";
import { navigate, store, View } from "../store";
import { CloseOutlined } from "@ant-design/icons";
import { DataService, getDataService } from "../services/data_service";


export interface EditCategoriesFormProps {
    budget_id: string;
    categories?: Category[];
    onCategoriesAdded: () => void;
    onCancel: () => void;
}

interface EditCategoriesFormState {

}

export class AddCategoriesForm extends React.Component<EditCategoriesFormProps, EditCategoriesFormState> {
    data_service: DataService;

    constructor(props: EditCategoriesFormProps) {
        super(props);
        this.data_service = getDataService();
    }

    render() {
        return (
            this.render_add_category()
        );
    }

    render_add_category() {
        const formRef = React.createRef<FormInstance>();
        const onFinish = (values: any) => {
            const category_list: Category[] = [];
            for (const raw_category of values.categories) {
                const category = DataModelFactory.createCategory(0);
                category.name = raw_category.name;
                category.allocation = raw_category.allocation;
                category_list.push(category);
            }
            this.setState({ is_loading: true });
            this.data_service.createCategories(this.props.budget_id, category_list).then((value: Budget) => {
                this.props.onCategoriesAdded();
            }).catch((_error: any) => {
            });
        };
        return (
            <Form
                name="add_categories"
                style={{ minWidth: 300, marginTop: 30, minHeight: 200 }}
                autoComplete="off"
                initialValues={{ categories: [] }}
                ref={formRef}
                onFinish={onFinish}
            >
                <Form.List name="categories">
                    {(fields, { add, remove }) => (
                        <div style={{ display: 'flex', rowGap: 10, flexDirection: 'column', justifyContent: 'center' }}>
                            {fields.map((field) => (
                                <Flex
                                    gap={5}
                                    justify="center"
                                    align="center"
                                    key={field.key}
                                >
                                    <Form.Item name={[field.name, 'name']} rules={[{ required: true, message: "Name is required" }]}>
                                        <Input placeholder="Category" />
                                    </Form.Item>
                                    <Form.Item name={[field.name, 'allocation']} rules={[{ required: true, message: "Allocation is required" }]}>
                                        <InputNumber type="number" inputMode="numeric" placeholder="Amount" />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button shape="circle" danger icon={<CloseOutlined />} onClick={() => remove(field.name)} />
                                    </Form.Item>
                                </Flex>
                            ))}
                            {fields.length === 0 && (
                                <Empty description="No Categories Added" />
                            )}

                            <Button type="default" onClick={() => add()} block>
                                + Add Category
                            </Button>

                            <Button type="primary" htmlType="submit" block>
                                Finalize
                            </Button>
                            <Button type="link" onClick={() => this.props.onCancel()}>Cancel</Button>
                        </div>
                    )}
                </Form.List>
            </Form>
        );
    }
}
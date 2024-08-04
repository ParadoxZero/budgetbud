import { Button, Card, Empty, Form, FormInstance, Input, InputNumber } from "antd";
import React from "react";
import { Budget, Category, DataModelFactory } from "../datamodel/datamodel";
import { navigation, store, View } from "../store";
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
                style={{ maxWidth: 600 }}
                autoComplete="off"
                initialValues={{ categories: [] }}
                ref={formRef}
                onFinish={onFinish}
            >
                <Form.List name="categories">
                    {(fields, { add, remove }) => (
                        <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column', justifyContent: 'center' }}>
                            {fields.map((field) => (
                                <Card
                                    size="small"
                                    key={field.key}
                                    actions={[<CloseOutlined onClick={() => remove(field.name)} />]}
                                >
                                    <Form.Item label="Name" name={[field.name, 'name']} rules={[{ required: true, message: "Name is required" }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Allocated Amount" name={[field.name, 'allocation']} rules={[{ required: true, message: "Allocation is required" }]}>
                                        <InputNumber type="number" inputMode="numeric" />
                                    </Form.Item>
                                </Card>
                            ))}
                            {fields.length === 0 && (
                                <Empty description="No Categories Added" />
                            )}

                            <Button type="dashed" onClick={() => add()} block>
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
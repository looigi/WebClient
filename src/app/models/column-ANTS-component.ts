import { ColumnBase, CellTemplateDirective, GroupFooterTemplateDirective,
  FilterCellTemplateDirective, FilterMenuTemplateDirective, ColumnSortSettings,
  } from '@progress/kendo-angular-grid';
import { GroupHeaderTemplateDirective } from '@progress/kendo-angular-excel-export';
import { TemplateRef } from '@angular/core';

export declare function isColumnComponent(column: any): column is ColumnANTS;

export declare class ColumnANTS extends ColumnBase {
    /**
     * The field to which the column is bound.
     */
    field: string;
    /**
     * The format that is applied to the value before it is displayed.
     * Takes the `{0:format}` form where `format` is a standard number format, a custom number format,
     * a standard date format, or a custom date format.
     *
     * For more information on the supported date and number formats,
     * refer to the [kendo-intl](https://github.com/telerik/kendo-intl/blob/develop/docs/index.md) documentation.
     *
     * @example
     * ```html-no-run
     * <kendo-grid>
     *    <kendo-grid-column field="UnitPrice" format="{0:c}">
     *    </kendo-grid-column>
     * </kendo-grid>
     * ```
     */
    format: string;
    /**
     * Allows the column headers to be clicked and the `sortChange` event emitted.
     * You have to handle the `sortChange` event yourself and sort the data.
     */
    sortable: boolean | ColumnSortSettings;
    /**
     * Determines if the column can be dragged to the group panel. The default value is `true`.
     * If set to `false`, you can group the columns by the column field by using the API of the Grid.
     */
    groupable: boolean;
    /**
     * Defines the editor type. Used when the column enters the edit mode. The default editor type is `text`.
     *
     * @example
     * ```html-no-run
     * <kendo-grid>
     *    <kendo-grid-column field="UnitPrice" [editor]="'numeric'">
     *    </kendo-grid-column>
     * </kendo-grid>
     * ```
     */
    editor: 'text' | 'numeric' | 'date' | 'boolean';
    /**
     * Defines the filter type that is displayed inside the filter row. The default value is `text`.
     *
     * @example
     * ```html-no-run
     * <kendo-grid>
     *    <kendo-grid-column field="UnitPrice" [filter]="'numeric'">
     *    </kendo-grid-column>
     * </kendo-grid>
     * ```
     */
    filter: 'text' | 'numeric' | 'boolean' | 'date';
    /**
     * Defines if a filter UI will be displayed for this column. The default value is `true`.
     *
     * @example
     * ```html-no-run
     * <kendo-grid>
     *    <kendo-grid-column field="UnitPrice" [filterable]="false">
     *    </kendo-grid-column>
     * </kendo-grid>
     * ```
     */
    filterable: boolean;
    /**
     * Defines whether the column is editable. The default value is `true`.
     *
     * @example
     * ```html-no-run
     * <kendo-grid>
     *    <kendo-grid-column field="UnitPrice" [editable]="false">
     *    </kendo-grid-column>
     * </kendo-grid>
     * ```
     */
    editable: boolean;
    hiddenLabel: boolean;
    icon: string;
    isEditable: boolean;
    domain: string;
    domainType: string;
    dataType: string;
    template: CellTemplateDirective;
    groupHeaderTemplate: GroupHeaderTemplateDirective;
    groupFooterTemplate: GroupFooterTemplateDirective;
    editTemplate: CellTemplateDirective;
    filterCellTemplate: FilterCellTemplateDirective;
    filterMenuTemplate: FilterMenuTemplateDirective;
    description: string;

    readonly templateRef: TemplateRef<any>;
    readonly groupHeaderTemplateRef: TemplateRef<any>;
    readonly groupFooterTemplateRef: TemplateRef<any>;
    readonly editTemplateRef: TemplateRef<any>;
    readonly filterCellTemplateRef: TemplateRef<any>;
    readonly filterMenuTemplateRef: TemplateRef<any>;
    readonly displayTitle: string;

    constructor(parent?: ColumnBase);
}

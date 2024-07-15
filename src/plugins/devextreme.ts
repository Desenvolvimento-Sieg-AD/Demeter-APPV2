import { DxDataGrid, DxList, } from 'devextreme-vue';
import {
  DxEditing,
  DxTexts,
  DxColumn,
  DxColumnChooser,
  DxColumnChooserSearch,
  DxColumnChooserSelection,
  DxColumnFixing,
  DxFilterPanel,
  DxFilterRow,
  DxGroupPanel,
  DxGrouping,
  DxHeaderFilter,
  DxPager,
  DxPaging,
  DxPosition,
  DxRemoteOperations,
  DxScrolling,
  DxSearch,
  DxSearchPanel,
  DxSorting,
  DxStateStoring,
  DxLoadPanel,
  DxToolbar,
  DxItem,
  DxMasterDetail,
  DxRowDragging,
  DxGroupItem,
  DxSummary,
  DxTotalItem,
} from 'devextreme-vue/data-grid';
import {
  DxTreeList,
  DxSelection,
  DxLookup,
} from 'devextreme-vue/tree-list';
import {
  DxFileManager,
  DxPermissions,
  DxItemView,
  DxContextMenu,
  DxContextMenuItem,
  DxDetails,
  DxToolbarItem,
  DxUpload,
  DxFileSelectionItem,
  DxNotifications,
}
  from 'devextreme-vue/file-manager';
import { DxFileUploader } from 'devextreme-vue/file-uploader';
import { DxPopup } from 'devextreme-vue/popup';
import ptMessages from "devextreme/localization/messages/pt.json";
import { locale, loadMessages } from "devextreme/localization";

loadMessages(ptMessages);
locale("pt");

export default defineNuxtPlugin((nuxtApp) => {

  nuxtApp.vueApp
    .component("DxDataGrid", DxDataGrid)
    .component("DxColumn", DxColumn)
    .component("DxColumnFixing", DxColumnFixing)
    .component("DxColumnChooser", DxColumnChooser)
    .component("DxPosition", DxPosition)
    .component("DxColumnChooserSearch", DxColumnChooserSearch)
    .component("DxColumnChooserSelection", DxColumnChooserSelection)
    .component("DxFilterRow", DxFilterRow)
    .component("DxFilterPanel", DxFilterPanel)
    .component("DxSearchPanel", DxSearchPanel)
    .component("DxGroupPanel", DxGroupPanel)
    .component("DxGrouping", DxGrouping)
    .component("DxRemoteOperations", DxRemoteOperations)
    .component("DxScrolling", DxScrolling)
    .component("DxSorting", DxSorting)
    .component("DxPaging", DxPaging)
    .component("DxPager", DxPager)
    .component("DxHeaderFilter", DxHeaderFilter)
    .component("DxSearch", DxSearch)
    .component("DxStateStoring", DxStateStoring)
    .component("DxList", DxList)
    .component("DxTreeList", DxTreeList)
    .component("DxSelection", DxSelection)
    .component("DxLookup", DxLookup)
    .component("DxPopup", DxPopup)
    .component("DxLoadPanel", DxLoadPanel)
    .component("DxToolbar", DxToolbar)
    .component("DxMasterDetail", DxMasterDetail)
    .component("DxRowDragging", DxRowDragging)
    .component('DxGroupItem', DxGroupItem)
    .component('DxSummary', DxSummary)
    .component("DxFileManager", DxFileManager)
    .component("DxPermissions", DxPermissions)
    .component("DxItem", DxItem)
    .component("DxItemView", DxItemView)
    .component("DxContextMenu", DxContextMenu)
    .component("DxContextMenuItem", DxContextMenuItem)
    .component("DxDetails", DxDetails)
    .component("DxToolbarItem", DxToolbarItem)
    .component("DxUpload", DxUpload)
    .component("DxFileSelectionItem", DxFileSelectionItem)
    .component("DxNotifications", DxNotifications)
    .component("DxFileUploader", DxFileUploader)
    .component("DxTotalItem", DxTotalItem)
    .component("DxEditing", DxEditing)
    .component("DxTexts", DxTexts)
})
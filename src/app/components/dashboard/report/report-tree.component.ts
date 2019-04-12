import {Component} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {SessionService} from '../../../services/session.service';

import {PanelBarItemModel} from '@progress/kendo-angular-layout';
import {Router} from '@angular/router';


@Component({
    styles: [`
    :host /deep/ .k-group {
      padding-left: 15px;
    }
  `],

    templateUrl: 'report-tree.html'
})
export class ReportTreeComponent {
  reportTree: Array<any>;

    constructor(private apiService: ApiService, private router: Router) {
        this.queryTSS();
    }

    private queryTSS(): void {
        this.apiService.getReportTree()
            .map(response => response.json())
            .map(response => response.DataTable)
            .subscribe(reports => {

                // console.log('menu:', reports);

                const root_id = 'NAME is not null';

                function addChildren(node, array) {
                    const treenode = <PanelBarItemModel>{
                        id: node.OBJ_ID,
                        title: ' ' + node.LABEL,
                        children: [],
                        expanded: node.OBJ_ID === root_id,
                        // icon: node.NODE_TYPE === 'Folder' ? 'folder' : 'file'
                        imageUrl: node.NODE_TYPE === 'Folder' ? 'assets/img/icons/Folder-C.png' : 'assets/img/icons/FullList.png'
                      };
                    // console.log('Adding children to..' , treenode.title)
                    // console.log("array : ", array);
                    treenode.children = array
                        .filter(current => {
                            return current.FATHER_ID === treenode.id;
                        })
                        .map(current => addChildren(current, array));

                    return treenode;
                }
                if (reports && reports.filter) {
                  this.reportTree = reports.filter(e => e.OBJ_ID === root_id).map(e => addChildren(e, reports));
                }
            });
    }

    public stateChange(data: Array<PanelBarItemModel>): boolean {
        const focusedEvent: PanelBarItemModel = data.filter(item => item.focused === true)[0];
        // console.log('selezione menu Report:', focusedEvent.id);
        const olapId = focusedEvent.id.substring(focusedEvent.id.indexOf('\'') + 1, focusedEvent.id.lastIndexOf('\''));
        // console.log('olapId:',olapId);
        this.router.navigate(['/dashboard/report'], {queryParams: {olapId: olapId}});
        return false;
    }

}

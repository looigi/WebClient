import {Component, Output, ViewChild, ViewEncapsulation, OnInit, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {SessionService} from '../../../services/session.service';

import {PanelBarItemModel} from '@progress/kendo-angular-layout';
import {Router} from '@angular/router';
import {EventLogMainComponent} from './event-log';
import { DashboardHeaderComponent } from '../main/header/header.component';


@Component({
    styles: [`
    :host /deep/ .k-group {
      padding-left: 15px;
    }
  `],
    templateUrl: 'eventlog-tree.component.html'
})

export class EventLogTreeComponent implements AfterViewChecked {
  @ViewChild('component1') component1: EventLogMainComponent;

  public eventLogTree: Array<any>;

    constructor(private cdRef: ChangeDetectorRef,
      private apiService: ApiService,
      private sessionService: SessionService,
      private router: Router) {
        this.queryTSS();
    }

    ngAfterViewChecked() {
      const t = DashboardHeaderComponent.t;
      t.writePageName('Event Log');
      this.cdRef.detectChanges();
    }

    private queryTSS(): void {
        this.apiService.getEventLogTree()
            .map(response => response.json())
            .map(response => response.DataTable)
            .subscribe(reports => {
                const root_id = 'CATEGORY is not null';

                function addChildren(node, array) {
                    const treenode = <PanelBarItemModel>{
                        id: node.OBJ_ID,
                        title: ' ' + node.LABEL,
                        children: [],
                        expanded: node.OBJ_ID === root_id,
                        // icon: node.NODE_TYPE === 'Folder' ? 'folder' : 'file'
                    };

                    treenode.children = array
                        .filter(current => {
                            return current.FATHER_ID === treenode.id;
                        })
                        .map(current => addChildren(current, array));

                    return treenode;
                }
                this.eventLogTree = reports.filter(e => e.OBJ_ID === root_id).map(e => addChildren(e, reports));
            });
    }

    public stateChange(data: Array<PanelBarItemModel>): boolean {
      const focusedEvent: PanelBarItemModel = data.filter(item => item.focused === true)[0];
      const categoryID = focusedEvent.id.substring(focusedEvent.id.indexOf('\'') + 1, focusedEvent.id.lastIndexOf('\''));

      this.router.navigate(['/dashboard/event-log'], {queryParams: {category: categoryID}});

      return false;
    }

}

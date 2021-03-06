# angular-table
使用AngularJs封装表格内容渲染组件


## 功能描述
　　该组件是管理系统中很常用的功能，管理系统的典型使用是批量数据的处理，表格展示是最直接的方式。该插件实现：
* 批量数据的列表展示
* 每行数据提供操作项（修改，删除等）接口
* 翻页查询接口
* 每页显示条数修改
* 点击表头排序
* 列表宽度自定义
* 跳转至某页
* ...

***
##  html结构
　　承载该表格插件的主要html结构如下（直接内联了部分样式 ,且不是完整的html结构，只是该组件的模板部分）
``` javascript
<meta charset="UTF-8">
<style>
.pagination>li {
    cursor: pointer;
    -moz-user-select:none;
    -webkit-user-select:none;
    -ms-user-select:none;
    -khtml-user-select:none;
    user-select:none;
}
.overLength {
    overflow: hidden;  
    text-overflow: ellipsis;  
    white-space: nowrap;  
}
.tp th{
    min-width: 100px;
}
</style>
<div style="width: 100%;overflow: auto" class="tablediv">
<table stlye="min-width:1000px;" class="table table-bordered table-hover table-striped table-condensed tp">
    <thead>
        <tr>
            <th ng-if="$ctrl.hasCheck"><input type="checkbox" ng-model="$ctrl.tChooseAll" ng-click="$ctrl.triChooseAll($ctrl.config.rows)"></th>
            <th ng-if="$ctrl.hasIndex"></th>
            <th ng-if="$ctrl.hasRadio">选择</th>
            <th class=" {{col.thCss()}} " ng-repeat="col in $ctrl.columns|filter:$ctrl.tdFilter" ng-bind="col.label"
                ng-class="{noSortCss:!col.sort,css:$ctrl.sort.column != key && col.sort,upCss:$ctrl.sort.column == key && $ctrl.sort.order == 'ASC' && col.sort,downCss:$ctrl.sort.column == key && $ctrl.sort.order == 'DESC' && col.sort}"
                ng-click="$ctrl.sortTrigger(col)" width="{{col.width}}" ng-style="col.thStyle()"></th>
            <th ng-if="$ctrl.hasOperation">操作</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="row in $ctrl.config.rows">
            <td ng-if="$ctrl.hasCheck"><input type="checkbox" ng-model="$ctrl.tCheck[$index]" ng-click="$ctrl.checked(row,$index)"></td>
            <td ng-if="$ctrl.hasIndex" ng-bind="$ctrl.config.currentPage*$ctrl.countPerPage+$index+1"></td>
            <td ng-if="$ctrl.hasRadio"><input type="radio" ng-model="$ctrl.tRadio" ng-value="$index" ng-click="$ctrl.selectRadio(row,$index)"></td>
            <td class="overLength {{col.tdCss(row)}}" ng-repeat="col in $ctrl.columns|filter:$ctrl.tdFilter" title="{{row|getTdValue:col:true}}"
                ng-bind-html="row|getTdValue:col" width="{{col.width}}" ng-click="col.onClick(row)" ng-style="col.tdStyle(row)"></td>
            <td ng-if="$ctrl.hasOperation">
                <ng-repeat ng-repeat="opt in $ctrl.operation">
                    <a ng-if="!$ctrl.isDisabled(opt,row)" ng-bind='opt.label' ng-click="opt.doFunc(row)" class="btn-click"></a>
                    <a ng-if="$ctrl.isDisabled(opt,row)" ng-bind='opt.label' class="btn-click"></a>
                </ng-repeat>
            </td>
        </tr>
    </tbody>
</table>
</div>
<div ng-if="$ctrl.totalPage > 0" class="pagination-panel">
    <div class="pagination-right">
        <span>显示{{$ctrl.dataBegin}}-{{$ctrl.dataEnd}}，共{{$ctrl.totalCount}}条数据</span>
    </div>
    <div class="pagination-left">
        <div class="perPage">
            <select 
                ng-model="$ctrl.countPerPage"
                ng-options="value for value in $ctrl.numPerPage"
                ng-change="$ctrl.onPerPageChange()">
            </select>
        </div>
        <ul class="pagination">
            <li ng-class="{disabled:$ctrl.totalPage > 0 && $ctrl.config.currentPage == 0}"><a ng-click="$ctrl.lastPage()">&lt;上一页</a></li>
            <li ng-repeat="num in $ctrl.pageNum track by $index" ng-class="{active:($ctrl.config.currentPage + 1 == num)}"><a ng-click="$ctrl.selectedPage(num)" ng-bind="num"></a></li>
            <li ng-class="{disabled:($ctrl.totalPage-1) == $ctrl.config.currentPage}"><a ng-click="$ctrl.nextPage()">下一页&gt;</a></li>
        </ul>
        <div class="totalPage">
            <span>共{{$ctrl.totalPage}}页，</span>
            <span>到</span>
            <input ng-model="$ctrl.turnTo" type="number" min="1" class="turnToPage" ng-keypress="$ctrl.putPageNum($event)">
            <span>页</span>
            <button ng-click="$ctrl.selectedPage($ctrl.turnTo)">跳转</button>
        </div>
    </div>
</div>
```

***
## 主要逻辑解释
### 数据绑定
``` javascript
bindings:{
        id:'@?',
        columns:'<',
        pageLength:'<?',
        operation:'<?',
        numPerPage:'=?',
        hasIndex:'=?',
        hasRadio:'=?',
        hasCheck:'=?',
        defaultCheck:'<?',
        removeLoadingBox:'=?',
        initReq:'=?',
        sortColumn:'@?defaultSortColumn',
        order:'@?defaultOrder',
        radio:'&onCheck',
        beforeCheck:'&onMulCheck',
        afterCheck:'&onCancelMulCheck',
        update:'&onUpdate'
},
```

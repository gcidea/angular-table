
angular.module('portalApp').component('tablePagination',{
	templateUrl:'/component/table/index.html',
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
	controller:['$http','$scope','$q','Box',function($http,$scope,$q,Box){
		var ctrl = this;
		var logError = "[table-pagination]:";
		
		$scope.$watch(function(){
			return ctrl.config;
		},function(newValue,oldValue){
			if(newValue != undefined) {
				var config = newValue;
				if(config.currentPage == undefined || config.count == undefined) {
					throw new Error(logError+"pagination data is empty");
				}
				
				//重渲染checkbox、radio选择情况
				if(ctrl.defaultCheck != undefined) {
					tpService.renderCheck();
				} else {
					if(ctrl.hasCheck == true) {
						ctrl.tCheck = {};
						for(var i = 0 ; i < config.rows.length ; i++) {
							ctrl.tCheck[i] = false;
						}
					} else if(ctrl.hasRadio == true) {
						ctrl.tRadio = -1;
					}
				}
				tpService.isAllCheck();
				
				//重渲染分页情况
				ctrl.pageNum = [];
				ctrl.totalPage = parseInt((config.count + ctrl.countPerPage - 1) / ctrl.countPerPage);
				ctrl.dataBegin = config.currentPage * ctrl.countPerPage + 1;
				ctrl.dataEnd = ctrl.dataBegin + config.rows.length - 1;
				ctrl.totalCount = config.count;
				ctrl.turnTo = config.currentPage + 1;
				
				var currentPage = config.currentPage+1;
				if(ctrl.totalPage <= ctrl.pageLength + 2) {
					for(var i = 1 ; i <= ctrl.totalPage ; i++) {
						ctrl.pageNum.push(i);
					}
				} else {
					if(currentPage <= ctrl.pageLength){
                        for(i = 1; i <= ctrl.pageLength + 1; i++){
                            ctrl.pageNum.push(i);
                        }
                        ctrl.pageNum.push('...');
                        ctrl.pageNum.push(ctrl.totalPage);
                    } else if (currentPage >= ctrl.totalPage - ctrl.pageLength + 1){
                        ctrl.pageNum.push(1);
                        ctrl.pageNum.push('...');
                        for(i = ctrl.totalPage - ctrl.pageLength; i <= ctrl.totalPage; i++){
                            ctrl.pageNum.push(i);
                        }
                    } else {
                    	var offset = Math.floor(ctrl.pageLength / 2);
                    	
                        ctrl.pageNum.push(1);
                        ctrl.pageNum.push('...');
                        
                        if(ctrl.pageLength%2 != 0) {
                        	for(i = currentPage - offset; i < currentPage; i++) {
                            	ctrl.pageNum.push(i);
                            }
                            ctrl.pageNum.push(i);
                            for(i = currentPage + 1; i <= offset + currentPage; i++){
                                ctrl.pageNum.push(i);
                            }
                        } else {
                        	for(i = currentPage - offset + 1; i < currentPage; i++) {
                            	ctrl.pageNum.push(i);
                            }
                        	for(i = currentPage; i <= offset + currentPage; i++){
                                ctrl.pageNum.push(i);
                            }
                        }

                        if(ctrl.pageNum[ctrl.pageNum.length-1] != ctrl.totalPage - 1) {
                        	ctrl.pageNum.push('...');
                        }
                        ctrl.pageNum.push(ctrl.totalPage);
                    }
				}
			}
		});
		
		ctrl.$onInit = function() {
			//初始化选择项
			if(ctrl.hasRadio == undefined) {
				ctrl.hasRadio = false;
			}
			if(ctrl.hasCheck == undefined) {
				ctrl.hasCheck = false;
			} 
			if(ctrl.hasIndex == undefined) {
				ctrl.hasIndex = false;
			}
			
			//初始化分页长度
			if(ctrl.pageLength == undefined) {
				ctrl.pageLength = 2;
			}
			
			//初始化排序参数
			ctrl.sort = {
				column:ctrl.sortColumn,
				order:ctrl.order?ctrl.order.toUpperCase():undefined
			}
			
			//初始化每页数据量
			if(angular.isNumber(ctrl.numPerPage)) {
				var oldValue = ctrl.numPerPage;
				ctrl.numPerPage = [];
				ctrl.numPerPage.push(oldValue);
			} else if(!angular.isArray(ctrl.numPerPage)) {
				ctrl.numPerPage = [10,20,50];
			}
			ctrl.countPerPage = ctrl.numPerPage[0];
			
			$scope.$on("tpSearch",function(event,msg){
				if(ctrl.id == msg || !ctrl.id) {
					tpService.query(0,ctrl.countPerPage,ctrl.sort.column,ctrl.sort.order);
				} 
			});
			
			if(ctrl.initReq != false) {
				tpService.query(0,ctrl.countPerPage,ctrl.sort.column,ctrl.sort.order);
			}
		}
		
		ctrl.$onChanges = function(changesObj) {
			//重渲染操作单元格内容
			if(changesObj.operation != undefined && ctrl.operation != undefined) {
				if(ctrl.operation == undefined || ctrl.operation.length == 0) {
					ctrl.hasOperation = false;
				} else {
					ctrl.hasOperation = true;
				}
			}

			//重初始化列数组的默认参数
			if(changesObj.columns != undefined && ctrl.columns != undefined) {
				ctrl.columnKey = [];
				angular.forEach(ctrl.columns,function(value,key){
					if(value.attr != undefined && value.getMethod == undefined) {
						value.getMethod = value.attr;
					}
					if(value.sort == undefined) {
						value.sort = true;
					}
					if(value.isKey) {
						ctrl.columnKey.push(value);
					}
				});
			}
			
			//重渲染checkBox、radio选择情况
			if(changesObj.defaultCheck != undefined 
					&& ctrl.config != undefined
					&& ctrl.config.rows != undefined
					&& ctrl.defaultCheck != undefined) {
				tpService.renderCheck();
			}
		}
		
		ctrl.lastPage = function() {
			var currentPage = ctrl.config.currentPage;
			if(currentPage == 0) {
				return;
			}
			tpService.query(currentPage-1<0?0:currentPage-1,ctrl.countPerPage,ctrl.sort.column,ctrl.sort.order);
		}
		
		ctrl.nextPage = function() {
			var currentPage = ctrl.config.currentPage;
			var totalPage = ctrl.totalPage;
			if(currentPage + 1 >= totalPage) {
				return;
			}
			tpService.query(currentPage+1>=totalPage?currentPage:currentPage+1,ctrl.countPerPage,ctrl.sort.column,ctrl.sort.order);
		}
		
		ctrl.selectedPage = function(currentPage) {
			if(ctrl.turnTo != "..." && currentPage == "...") {
				return;
			}
			currentPage = parseInt(currentPage);
			if(isNaN(currentPage)) {
				Box.error("请输入大于0的数字");
				return ;
			}
			if(currentPage > ctrl.totalPage) {
				currentPage = ctrl.totalPage;
				ctrl.turnTo = ctrl.totalPage;
			}
			currentPage--;
			tpService.query(currentPage,ctrl.countPerPage,ctrl.sort.column,ctrl.sort.order);
		}
		
		ctrl.sortTrigger = function(col) {
			if(!col.sort) {
				return;
			}
			var colName = col.attr;
			if(ctrl.sort.column == colName){
				tpService.query(ctrl.config.currentPage,ctrl.countPerPage,ctrl.sort.column,ctrl.sort.order == 'ASC'?'DESC':'ASC');
				ctrl.sort.order = (ctrl.sort.order == 'ASC'?'DESC':'ASC');
			} else {
				tpService.query(ctrl.config.currentPage,ctrl.countPerPage,colName,'ASC');
				ctrl.sort = {
					column:colName,
					order:'ASC'	
				};
			}
		}
		
		ctrl.isDisabled = function(opt,data) {
			if(opt != undefined && opt.isDisabled != undefined) {
				return opt.isDisabled(data);
			} else {
				return false;
			}
		}
		
		ctrl.triChooseAll = function($event) {
			if(ctrl.config == undefined || ctrl.config.rows == undefined) {
				$event.preventDefault();
				return;
			}
			if(ctrl.tChooseAll) {
				for(var i = 0; i < ctrl.config.rows.length ; i++) {
					ctrl.tCheck[i] = true;
					ctrl.beforeCheck({data:ctrl.config.rows[i]});
				}
			} else {
				for(var i = 0; i < ctrl.config.rows.length ; i++) {
					ctrl.tCheck[i] = false;
					ctrl.afterCheck({data:ctrl.config.rows[i]});
				}
			}
		}
		
		ctrl.checked = function(row,index) {
			var status = ctrl.tCheck[index];
			if(status == true) {
				tpService.isAllCheck();
				ctrl.beforeCheck({data:row});
			} else {
				ctrl.tChooseAll = false;
				ctrl.afterCheck({data:row});
			}
		}
		
		ctrl.selectRadio = function(row,index) {
			ctrl.radio({data:row});
		}
		
		ctrl.tdFilter = function (value, index, array) {
			return value.hidden?false:true;
        }
		
		ctrl.onPerPageChange = function() {
			tpService.query(0,ctrl.countPerPage,ctrl.sort.column,ctrl.sort.order);
		}
		
		ctrl.putPageNum = function($event) {
			if(!ctrl.turnTo && $event.keyCode == 48) {
				$event.preventDefault();
			} else if($event.keyCode == 13) {
				ctrl.selectedPage(ctrl.turnTo);
			}
		}

		/**
		 * 私有方法
		 */
		var tpService = {
			/**
			 * 表格数据的更新方法
			 */
			query : function(currentPage,countPerPage,indexOrderKey,indexOrder) {
				var pageInfo = {
					currentPage:currentPage,
					numberPerPage:countPerPage,
					indexOrderKey:indexOrderKey,
					indexOrder:indexOrder	
				};
				var loadingDialogId = null;
				$q(function(resolve, reject) {
					if(!ctrl.removeLoadingBox){
						loadingDialogId = Box.startLoading("查询中...");
					}
					ctrl.update({reqInfo:pageInfo,toTable:resolve});
				}).then(function(msg) {
					if(!ctrl.removeLoadingBox){
						setTimeout(function(id){
							return function() {
								Box.stopLoading(id);
							}
						}(loadingDialogId),100);
					}
					if(angular.isObject(msg)) {
						ctrl.config = msg;
					} else {
						Box.error(msg);
					}
				});
			},
			/**
			 * 检查checkbox全选情况
			 */
			isAllCheck : function() {
				var isAll = true;
				for(i in ctrl.tCheck) {
					if(!ctrl.tCheck[i]) {
						isAll = false;
						break;
					}
				}
				if(isAll) {
					ctrl.tChooseAll = true;
				} else {
					ctrl.tChooseAll = false;
				}
			},
			/**
			 * 重渲染行选中情况
			 */
			renderCheck : function() {
				if(ctrl.hasCheck == true) {
					ctrl.tCheck = {};
					for(var i = 0 ; i < ctrl.config.rows.length ; i++) {
						ctrl.tCheck[i] = false;
						var waitToCheck;
						if(angular.isArray(ctrl.columnKey) && ctrl.columnKey.length > 1) {
							waitToCheck = {};
							for(k in ctrl.columnKey) {
								waitToCheck[ctrl.columnKey[k].attr] = ctrl.config.rows[i][ctrl.columnKey[k].attr];
							}
						} else {
							waitToCheck = ctrl.config.rows[i][ctrl.columnKey[0].attr];
						}
						for(j in ctrl.defaultCheck) {
							if(angular.equals(waitToCheck,ctrl.defaultCheck[j])) {
								ctrl.tCheck[i] = true;
								break;
							}
						}
					}
					if(Object.getOwnPropertyNames(ctrl.tCheck).length == ctrl.config.rows.length) {
						ctrl.tChooseAll = true;
					} else {
						ctrl.tChooseAll = false;
					}
				} else if(ctrl.hasRadio == true) {
					ctrl.tRadio = -1;
					if(angular.isArray(ctrl.defaultCheck) && ctrl.defaultCheck.length == 1) {
						for(var i = 0 ; i < ctrl.config.rows.length ; i++) {
							var waitToCheck;
							if(angular.isArray(ctrl.columnKey) && ctrl.columnKey.length > 1) {
								waitToCheck = {};
								for(k in ctrl.columnKey) {
									waitToCheck[ctrl.columnKey[k].attr] = ctrl.config.rows[i][ctrl.columnKey[k].attr];
								}
							} else {
								waitToCheck = ctrl.config.rows[i][ctrl.columnKey[0].attr];
							}
							if(angular.equals(waitToCheck,ctrl.defaultCheck[0])) {
								ctrl.tRadio = i;
								break;
							}
						}
					}
				}
			}
		};
	}]
}).filter('getTdValue',['$sce',function($sce){
	return function(input,exp,isTitle) {
		var result;
		if(angular.isFunction(exp.formatter)) {
			result = dataChange(exp.formatter(angular.copy(input[exp.attr]), angular.copy(input)));
		} else {
			if(!exp.getMethod) {
				if(!exp.attr) {
					throw new Error("[table-pagination]:columns Error");
				}
 				exp.getMethod = exp.attr;
			}
			var attr = exp.getMethod.split(".");
			var initValue = input[attr.shift()];
			var value = attr.reduce(function(preValue,curValue,curIndex){
				return preValue[curValue];
			},initValue);
			result = dataChange(value);
		}
		return $sce.trustAsHtml(!result || (isTitle && exp.isHtml)?"":result);
	};
	
	function dataChange(data) {
		if(data == null || data == undefined) {
			return "";
		}
		return String(data);
	}
}]);
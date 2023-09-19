<template>
    <div>
        <n-card class="full-screen" title="磁盘统计" header-style="text-align: center" :bordered="false" size="small">
            <n-data-table size="small" max-height="calc(100vh - 105px)" :loading="loading" virtual-scroll :columns="columns"
                :data="result" :bordered="false" :row-class-name="rowColor" />
        </n-card>
    </div>
</template>
  
<script>
import { host } from "../plugins/api"
import util from "../plugins/util"

export default {
    name: "DiskStat",
    data: () => ({
        id: 0,
        loading: true,
        command: "df -h",
        result: [],
        columns: [{
            title: '文件系统',
            key: 'system',
            width: 200,
            ellipsis: {
                tooltip: true
            }
        }, {
            title: '大小',
            key: 'size',
            width: 90
        }, {
            title: '已用',
            key: 'used',
            width: 90
        }, {
            title: '可用',
            key: 'avail',
            width: 90
        }, {
            title: '使用率',
            key: 'proportion',
            sorter: 'default',
            width: 90
        }, {
            title: '挂载位置',
            key: 'position',
            ellipsis: {
                tooltip: true
            }
        }]
    }),
    methods: {
        init(id) {
            this.id = id
            this.getData()
        },
        getData() {
            host.runCMD(this.id, this.command).then(res => {
                this.loading = false
                if (res.state) {
                    let list = []
                    let cache = res.data.split('\n')
                    for (let i = 1; i < cache.length; i++) {
                        if (cache[i].length == 0) continue;
                        let item = util.cleanShellData(cache[i])
                        list.push(item.split(' '))
                    }
                    let result = []
                    for (let i in list) {
                        let item = list[i]
                        result.push({
                            system: item[0],
                            size: item[1] + 'B',
                            used: item[2] + 'B',
                            avail: item[3] + 'B',
                            proportion: parseInt(item[4].substring(0, item[4].length - 1)),
                            position: item[5]
                        })
                    }
                    this.result = result.sort(function (a, b) {
                        var x = a.system.toLowerCase();
                        var y = b.system.toLowerCase();
                        if (x < y) { return -1; }
                        if (x > y) { return 1; }
                        return 0;
                    });
                } else {
                    window.$message.warning('执行失败, 系统暂不支持')
                }
            }).catch(err => {
                console.log(err)
                this.loading = false
                window.$message.warning('执行失败, 发生意料之外的错误')
            })
        },
        rowColor(row) {
            if (row.proportion >= 90) return "pro3"
            else if (row.proportion >= 80) return "pro2"
            else if (row.proportion >= 60) return "pro1"
            return ""
        }
    }
};
</script>
<style scoped>
#group-list {
    flex-wrap: wrap;
    display: flex;
}

.group-item {
    background-color: rgba(255, 255, 255, .08);
    margin: 0 10px 10px 0;
    border-radius: 8px;
    position: relative;
    min-width: 188px;
}

.full-screen:deep(.pro1 td) {
    color: #e7b100;
}


.full-screen:deep(.pro2 td) {
    color: #e57a00;
}

.full-screen:deep(.pro3 td) {
    color: #ff0000;
}
</style>
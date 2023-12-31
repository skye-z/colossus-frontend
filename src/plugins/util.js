const util = {
    // 构建文件路径
    buildFilePath(oldList, newList, index) {
        let path = ''
        if (newList.length > 6) {
            for (let i = 0; i <= newList.length - 5; i++) {
                path += '/' + newList[i]
            }
        }
        for (let i = (newList.length > 6 ? 2 : 0); i <= index; i++) {
            path += '/' + oldList[i]
        }
        if (path.length > 1) {
            let check = path.substring(0, 2);
            if (check == '/~' || check == '//') path = path.substring(1)
        }
        return path
    },
    // 解析文件数据
    analysisFile(data) {
        if (data.name == '.' || data.name == '..') return null;
        if (data.type == 1) data.typeName = '文件'
        else if (data.type == 2) data.typeName = '目录'
        else if (data.type == 3) data.typeName = '程序'
        else if (data.type == 4) data.typeName = '链接'

        if (data.name.indexOf('->') != -1) {
            data.type = 4
            data.typeName = '链接'
            data.path = data.name.substring(data.name.indexOf('->') + 2, data.name.length)
            data.name = data.name.substring(0, data.name.indexOf('->'))
        }

        data.owner = data.user + ' / ' + data.group
        if (data.type == 2 || data.type == 4) data.sizeText = '-'
        else data.sizeText = util.bytes2Size(data.size)
        return data
    },
    // 字节转文件大小
    bytes2Size(number) {
        var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        for (var i = 1; i < sizes.length; i++) {
          if (number < Math.pow(1024, i)) {
            return (Math.round((number / Math.pow(1024, i - 1)) * 100) / 100) + sizes[i - 1];
          }
        }
        return number;
    },
    // API函数错误
    funcError(err, loading, action) {
        loading = false
        console.log(err)
        window.$message.warning(action + '失败, 发生意料之外的错误')
    },
    // API函数错误(无加载)
    funcErrorNoLoading(err, action) {
        console.log(err)
        window.$message.warning(action + '失败, 发生意料之外的错误')
    },
    // API函数错误(自定义提示)
    funcErrorDIYTips(err, tips, action) {
        console.log(err)
        tips.type = 'warning'
        tips.content = action + "失败, 发生意料之外的错误"
        setTimeout(() => {
            tips.destroy()
        }, 2000)
    },
    // 构建期限提示信息
    buildPeriod(now, period) {
        let oneDay = 1000 * 60 * 60 * 24
        let offset = parseInt(period) - now
        if (offset <= 0) return '已过期'
        else {
            let txt = ''
            let num = 0
            if (offset >= (oneDay * 365)) {
                txt += (offset / (oneDay * 365)).toFixed(0) + '年'
                offset = offset % (oneDay * 365)
                num++
            }
            if (offset >= (oneDay * 30)) {
                txt += (offset / (oneDay * 30)).toFixed(0) + '月'
                offset = offset % (oneDay * 30)
                num++
            }
            if (num == 2) return txt
            if (offset >= (oneDay * 7)) {
                txt += (offset / (oneDay * 7)).toFixed(0) + '周'
                offset = offset % (oneDay * 7)
                num++
            }
            if (num == 2) return txt
            if (offset >= oneDay) txt += (offset / oneDay).toFixed(0) + '天'
            return txt
        }
    },
    // 清理Shell数据
    cleanShellData(text){
        if(text.indexOf('  ') == -1) return text
        else {
            text = text.replaceAll('  ', ' ')
            return util.cleanShellData(text)
        }         
    }
}

export default util
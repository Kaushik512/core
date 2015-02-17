function getErrMsgObj(msg) {
    return {
        message: msg
    }
}


module.exports = {
    chef: {
        connectionError: getErrMsgObj('Unable to Connect to Chef Server'),
        corruptChefData:getErrMsgObj('Chef server data corrupted. Please add a new chef server.')
    },
    db: {
        error: getErrMsgObj('Server Behaved Unexpectedly')
    },
    instance:{
    	notFound : getErrMsgObj('Instance Does Not Exist'),
        exist : getErrMsgObj('Instance Exist'),
    }

};
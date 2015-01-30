function getErrMsgObj(msg) {
    return {
        message: msg
    }
}


module.exports = {
    chef: {
        connectionError: getErrMsgObj('Unable to Connect to Chef Server')
    },
    db: {
        error: getErrMsgObj('Server Behaved Unexpectedly')
    },
    instance:{
    	notFound : getErrMsgObj('Instance Does Not Exist')
    }

};
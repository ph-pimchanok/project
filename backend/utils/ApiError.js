class ApiError extends Error{
// รับค่า error ex 404 และรับข้อความerror
    constructor(statusCode ,message){
        super(message)
        this.statusCode = statusCode
    }
}
module.exports =ApiError
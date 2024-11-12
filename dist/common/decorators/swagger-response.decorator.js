"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiStandardResponse = ApiStandardResponse;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiStandardResponse(model = null) {
    const successResponse = {
        result: { type: 'boolean', example: true },
        status: { type: 'integer', example: 200 },
        message: { type: 'string', example: 'Success' },
    };
    if (model) {
        if (typeof model === 'string') {
            successResponse['data'] = {
                type: model,
            };
        }
        else {
            const isArray = Array.isArray(model);
            const scheme = isArray ? model[0] : model;
            const ref = {
                $ref: (0, swagger_1.getSchemaPath)(scheme),
            };
            if (isArray) {
                successResponse['data'] = {
                    type: 'array',
                    items: {
                        anyOf: [ref],
                    },
                };
            }
            else {
                successResponse['data'] = ref;
            }
        }
    }
    return (0, common_1.applyDecorators)((0, swagger_1.ApiResponse)({
        status: '2XX',
        schema: {
            properties: successResponse,
        },
    }), (0, swagger_1.ApiResponse)({
        status: '4XX',
        schema: {
            properties: {
                statusCode: { type: 'integer', example: 400 },
                timestamp: { type: 'string', example: '2024-01-01 00:01:23' },
                path: { type: 'string', example: '/api/system/user' },
                message: { type: 'string', example: 'Bad Request' },
            },
        },
    }), (0, swagger_1.ApiResponse)({
        status: '5XX',
        schema: {
            properties: {
                statusCode: { type: 'integer', example: 500 },
                timestamp: { type: 'string', example: '2024-01-01 00:01:23' },
                path: { type: 'string', example: '/api/system/user' },
                message: { type: 'string', example: 'Internal Server Error' },
            },
        },
    }));
}
//# sourceMappingURL=swagger-response.decorator.js.map
import { loadSync } from "@grpc/proto-loader";
import { loadPackageDefinition, GrpcObject, Server, ServerCredentials, Metadata, MetadataValue } from "@grpc/grpc-js";
import { clearLine } from "readline";

const protoDir = __dirname + "/../proto/helloworld.proto";

export class HelloWorldService {
    grpcDefinition: any;
    constructor() {
        var packageDefinition = loadSync(protoDir, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        this.grpcDefinition = loadPackageDefinition(packageDefinition);
    }

    registerService(server: Server) {
        server.addService(this.grpcDefinition.helloworld.Greeter.service, {
            sayHelloSimple: this.sayHelloSimple,
            sayHelloServer: this.sayHelloServer,
            sayHelloClient: this.sayHelloClient,
            sayHelloDouble: this.sayHelloDouble,
        });
    }
    // 简单gRPC调用
    sayHelloSimple(call: any, callback: any) {
        // parse request metadata
        let callId = call.metadata.get("callId");
        console.log("callId=", callId);

        let s = 233;
        let code1: Buffer = Buffer.alloc(8);
        // code1.writeBigInt64LE(BigInt(12345));
        // code1.writeBigInt64LE(BigInt(200002002));
        code1.writeIntLE(s, 0, 2);
        // code1.writeUInt8(s);

        let code2: Buffer = Buffer.alloc(32);
        code2.writeDoubleLE(23333333.00002);

        let metadata = new Metadata();
        // keys that end with '-bin' must have Buffer values
        metadata.add("code-bin", code1);
        metadata.add("code-bin", Buffer.from("sss哈哈哈"));
        metadata.add("code-bin", code2);
        metadata.add("data", "sss");
        metadata.add("data", "21232323");
        callback(new Error("test error"), { message: "Hello " + call.request.name }, metadata);
        // callback(null, { message: "Hello " + call.request.name }, metadata);
    }
    // 简单gRPC调用
    sayHelloServer(call: any, callback: any) {
        let count = 0;
        let s = setInterval(() => {
            call.write({ message: "sayHelloServer: now time is:" + new Date() });
            count++;
            if (count > 10) {
                call.end();
                clearInterval(s);
            }
        }, 1000);

        call.on("end", function () {
            console.log("sayHelloServer: 客户端发送end,客户端关闭");
        });
    }
    // 简单gRPC调用
    sayHelloClient(call: any, callback: any) {
        call.on("data", (data: any) => {
            console.log("sayHelloClient: receive客户端: ", data);
        });
        call.on("close", function () {
            console.log("sayHelloClient:服务器发送end,客户端关闭");
            callback(null, { message: "Hello sayHelloClient" });
        });
    }
    // 简单gRPC调用
    sayHelloDouble(call: any, callback: any) {
        call.on("data", (data: any) => {
            console.log("sayHelloDouble: 客户端receive:", data);
            call.write({ message: "sayHelloDouble: you send to me:" + data.name });
        });
        call.on("end", function () {
            console.log("sayHelloDouble: 客户端发送end,客户端关闭");
        });
    }
}

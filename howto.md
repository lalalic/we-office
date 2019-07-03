#developer environment
>how to start dev
>>qili$yarn mongo
>>qili$yarn dev
>>we-office$yarn dev

> upgrade we-edit to local version
>>we-edit$ yarn build
>>we-office$ yarn upgrade we-edit@../we-edit/packages/we-edit

> upgrade plugins to local version (which upload plugins to local qili server)
>> we-edit$ yarn sync

> update schema and server code to qili server
>> qili sync

> upload/update plugin to cloud
>> change service in .worc to cloud 
>> we-edit$ yarn sync

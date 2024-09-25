/* eslint-disable */
import { util, configure } from 'protobufjs/minimal';
import * as Long from 'long';

export const protobufPackage = 'common';

export interface PaginateRequest {
  page: number;
  limit: number;
}

export interface PaginationObject {
  page: number;
  perPage: number;
  from: number;
  to: number;
  total: number;
}

export interface DateMessage {
  year: number;
  month: number;
  day: number;
}

export const COMMON_PACKAGE_NAME = 'common';

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}

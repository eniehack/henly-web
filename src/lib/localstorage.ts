import Ajv, { type JTDDataType, type JTDSchemaType } from 'ajv/dist/jtd';
const ajv = new Ajv();

export interface UserStorage {
	jid: string;
	password: string;
}

const userStorageSchema: JTDSchemaType<UserStorage> = {
	properties: {
		jid: { type: 'string' },
		password: { type: 'string' }
	}
} as const;

export const parseAsUserStorage = ajv.compileParser<UserStorage>(userStorageSchema);
export const serialize = ajv.compileSerializer<UserStorage>(userStorageSchema);
export const HENLYWEB_USER_STORAGE_ID = 'henly-web-user';

import Ajv, { type JTDDataType, type JTDSchemaType } from 'ajv/dist/jtd';
const ajv = new Ajv();

interface UserStorage {
	jid: {
		full: string;
		short: string;
	};
	host: string;
	password: string;
}

const userStorageSchema: JTDSchemaType<UserStorage> = {
	properties: {
		jid: {
			properties: { full: { type: 'string' }, short: { type: 'string' } }
		},
		host: { type: 'string' },
		password: { type: 'string' }
	}
} as const;

type UserStorageData = JTDDataType<typeof userStorageSchema>;
export const parseAsUserStorage = ajv.compileParser<UserStorageData>(userStorageSchema);
export const serialize = ajv.compileSerializer<UserStorageData>(userStorageSchema);
export const HENLYWEB_USER_STORAGE_ID = 'henly-web-user';

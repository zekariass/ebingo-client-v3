import crypto from 'crypto';

const botToken = '8315167211:AAGvx8p3ovgm6snPgtEf7JiaBgXjNhpSizY';
const secretKey = crypto.createHash('sha256').update(botToken).digest();

const data = {
  query_id: 'AAEaaB8ZAAAAAAN2fGFSR6Kx',
  user: JSON.stringify({
    id: 123456789,
    first_name: 'John',
    username: 'johndoe',
    language_code: 'en',
    phone_number: '+1234567890'
  }),
  auth_date: Math.floor(Date.now() / 1000).toString()
};

// Build data_check_string
const dataCheckString = Object.keys(data)
  .sort()
  .map(k => `${k}=${data[k]}`)
  .join('\n');

// Generate hash
const hash = crypto
  .createHmac('sha256', secretKey)
  .update(dataCheckString)
  .digest('hex');

const initData = new URLSearchParams({ ...data, hash }).toString();

console.log(initData);

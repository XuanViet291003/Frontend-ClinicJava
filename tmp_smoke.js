const axios = require('axios');
(async ()=>{
  try{
    const base='http://localhost:9000';
    const user = 'smoketest_' + Math.random().toString(36).substring(2,8);
    const pass = 'Test@1234';
    console.log('Registering', user);
    const reg = await axios.post(`${base}/v1/auth/register`, { username:user, password:pass, fullName:'Smoke Test' });
    console.log('Register response:', reg.data);
    const login = await axios.post(`${base}/v1/auth/login`, { username:user, password:pass });
    console.log('Login response:', login.data);
    const token = login.data.result;
    if(!token) throw new Error('No token');
    console.log('Token length', token.length);
    const headers = { Authorization: `Bearer ${token}` };
    const create = await axios.post(`${base}/v1/appointments/create?isSaveDraft=false`, { patientName:'Nguyen Van B', doctorId:1, time: new Date().toISOString().slice(0,19), note:'smoke' }, { headers });
    console.log('Create:', create.data);
    const list = await axios.get(`${base}/v1/appointments/list?page=0&size=10`, { headers });
    console.log('List:', list.data);
    const content = (list.data && list.data.result && list.data.result.content) ? list.data.result.content : (Array.isArray(list.data) ? list.data : (list.data.result || []));
    if(content && content.length>0){
      const id = content[0].id;
      console.log('Cancelling id', id);
      const cancel = await axios.put(`${base}/v1/appointments/cancel/${id}`, null, { headers });
      console.log('Cancel:', cancel.data);
    } else console.log('No content to cancel');
  }catch(e){
    console.error('Error', e.response ? e.response.data : e.message);
    process.exit(1);
  }
})();

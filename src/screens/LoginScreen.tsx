import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../store';
import { login, setToken as setApiToken } from '../utils/api';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('IMFT');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!staffId || !password) { Alert.alert('Error', 'Enter Staff ID and Password'); return; }
    setLoading(true);
    try {
      const data = await login(staffId, password, department);
      dispatch(setToken(data.session_token));
      dispatch(setUser(data));
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const demoLogin = async (sid: string, dept: string) => {
    setLoading(true);
    try {
      const data = await login(sid, 'password123', dept);
      dispatch(setToken(data.session_token));
      dispatch(setUser(data));
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.card}>
        <View style={s.logoBox}><Ionicons name="wifi" size={32} color="#FFF" /></View>
        <Text style={s.title}>Myanmar Link ISP</Text>
        <Text style={s.subtitle}>Field Team Mobile</Text>

        <View style={s.inputGroup}>
          <Text style={s.label}>Staff ID</Text>
          <TextInput value={staffId} onChangeText={setStaffId} placeholder="e.g. IMFT-T01" style={s.input} autoCapitalize="characters" />
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Password</Text>
          <View style={s.passRow}>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholder="Enter password" style={[s.input, { flex: 1 }]} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogin} style={s.loginBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.loginText}>Sign In</Text>}
        </TouchableOpacity>

        <Text style={s.demoLabel}>QUICK LOGIN</Text>
        <View style={s.demoRow}>
          {[{ sid: 'IMFT-T01', dept: 'IMFT', label: 'IMFT Tech' }, { sid: 'BMFT-T01', dept: 'BMFT', label: 'BMFT Tech' }, { sid: 'NOC001', dept: 'NOC', label: 'NOC' }].map(d => (
            <TouchableOpacity key={d.sid} onPress={() => demoLogin(d.sid, d.dept)} style={s.demoBtn}>
              <Text style={s.demoBtnText}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  logoBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#0052CC', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1A1C1E' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  input: { backgroundColor: '#F5F6F8', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 12 },
  loginBtn: { backgroundColor: '#0052CC', borderRadius: 24, padding: 16, alignItems: 'center', marginTop: 8 },
  loginText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  demoLabel: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 20, letterSpacing: 1 },
  demoRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  demoBtn: { backgroundColor: '#E8EAF6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  demoBtnText: { fontSize: 12, fontWeight: '600', color: '#283593' },
});

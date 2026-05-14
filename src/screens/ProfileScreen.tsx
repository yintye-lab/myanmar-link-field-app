import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, clearAuth } from '../store';
import { logout } from '../utils/api';

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.app.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await logout();
    dispatch(clearAuth());
  };

  return (
    <ScrollView style={s.container}>
      <View style={s.profileCard}>
        <View style={s.avatar}><Text style={s.avatarText}>{user?.name?.[0] || 'U'}</Text></View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.role}>{user?.department} · {user?.role}</Text>
        <Text style={s.staffId}>Staff ID: {user?.staff_id}</Text>
      </View>

      <View style={s.menuSection}>
        <MenuItem icon="person-outline" label="Account Settings" />
        <MenuItem icon="notifications-outline" label="Notifications" />
        <MenuItem icon="document-text-outline" label="My Reports" />
        <MenuItem icon="hardware-chip-outline" label="Equipment History" />
        <MenuItem icon="help-circle-outline" label="Help & Support" />
      </View>

      <View style={s.menuSection}>
        <Text style={s.sectionLabel}>APP INFO</Text>
        <View style={s.infoRow}><Text style={s.infoLabel}>Version</Text><Text style={s.infoValue}>1.0.0</Text></View>
        <View style={s.infoRow}><Text style={s.infoLabel}>Server</Text><Text style={s.infoValue}>isp-workforce-hub</Text></View>
        <View style={s.infoRow}><Text style={s.infoLabel}>Platform</Text><Text style={s.infoValue}>Expo / React Native</Text></View>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#BA1A1A" />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function MenuItem({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={s.menuItem}>
      <Ionicons name={icon as any} size={20} color="#666" />
      <Text style={s.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  profileCard: { backgroundColor: '#0052CC', padding: 30, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  name: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  role: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  staffId: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 },
  menuSection: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: '#999', padding: 12, paddingBottom: 4, letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: '#1A1C1E' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 13, color: '#666' },
  infoValue: { fontSize: 13, color: '#1A1C1E', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FFCDD2' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#BA1A1A' },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getIMFTDashboard, getDailyTarget, getMonthlyBonus } from '../utils/api';

export default function DashboardScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.app.user);
  const [stats, setStats] = useState<any>({});
  const [target, setTarget] = useState<any>({});
  const [bonus, setBonus] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [s, t, b] = await Promise.all([getIMFTDashboard(), getDailyTarget(), getMonthlyBonus()]);
      setStats(s); setTarget(t); setBonus(b);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0052CC" />}>
      {/* Welcome */}
      <View style={s.welcomeCard}>
        <View style={s.welcomeRow}>
          <View style={s.avatar}><Text style={s.avatarText}>{user?.name?.[0] || 'U'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.welcomeName}>Welcome, {user?.name}</Text>
            <Text style={s.welcomeRole}>{user?.department} · {user?.role}</Text>
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={s.kpiRow}>
        <KpiCard icon="today" label="Today" value={stats.today_total || 0} color="#0052CC" onPress={() => navigation.navigate('Jobs')} />
        <KpiCard icon="checkmark-circle" label="Done" value={stats.today_completed || 0} color="#006D3B" />
        <KpiCard icon="time" label="Pending" value={stats.today_pending || 0} color="#F57F17" />
        <KpiCard icon="hourglass" label="Approval" value={stats.all_pending_approval || 0} color="#7C4DFF" />
      </View>

      {/* Daily Target */}
      <View style={[s.card, target.target_met && { borderColor: '#006D3B', borderWidth: 2 }]}>
        <View style={s.cardHeader}>
          <Ionicons name="flag" size={18} color={target.target_met ? '#006D3B' : '#0052CC'} />
          <Text style={s.cardTitle}>Daily Target</Text>
          <Text style={[s.targetPct, { color: target.target_met ? '#006D3B' : '#0052CC' }]}>{target.progress_pct || 0}%</Text>
        </View>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${target.progress_pct || 0}%`, backgroundColor: target.target_met ? '#006D3B' : '#0052CC' }]} /></View>
        <Text style={s.targetDetail}>{target.installations || 0} installs + {target.services || 0} services = {target.points || 0}/{target.target_points || 8} pts</Text>
        <Text style={s.targetHint}>4 Installs (2pts) OR 8 Services (1pt) = Target</Text>
      </View>

      {/* Monthly Bonus */}
      <View style={[s.card, bonus.bonus_eligible && { borderColor: '#F57F17', borderWidth: 2, backgroundColor: '#FFFDE7' }]}>
        <View style={s.cardHeader}>
          <Ionicons name="trophy" size={18} color={bonus.bonus_eligible ? '#F57F17' : '#999'} />
          <Text style={s.cardTitle}>Monthly Bonus</Text>
        </View>
        <Text style={s.bonusValue}>{bonus.days_target_met || 0}<Text style={s.bonusSub}>/{bonus.bonus_threshold || 20} days</Text></Text>
        <Text style={s.targetDetail}>{bonus.total_jobs || 0} jobs this month · {bonus.bonus_eligible ? 'ELIGIBLE ✓' : `Need ${(bonus.bonus_threshold || 20) - (bonus.days_target_met || 0)} more days`}</Text>
      </View>

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Jobs')}>
          <Ionicons name="list" size={24} color="#0052CC" />
          <Text style={s.actionText}>My Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Map')}>
          <Ionicons name="map" size={24} color="#006D3B" />
          <Text style={s.actionText}>Map View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FFEBEE' }]}>
          <Ionicons name="warning" size={24} color="#BA1A1A" />
          <Text style={s.actionText}>Emergency</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#EDE7F6' }]} onPress={() => navigation.navigate('ONUBind', {})}>
          <Ionicons name="hardware-chip" size={24} color="#5E35B1" />
          <Text style={[s.actionText, { color: '#5E35B1' }]}>ONU Bind</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function KpiCard({ icon, label, value, color, onPress }: any) {
  return (
    <TouchableOpacity style={s.kpiCard} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[s.kpiValue, { color }]}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  welcomeCard: { backgroundColor: '#0052CC', margin: 16, marginBottom: 8, borderRadius: 16, padding: 16 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  welcomeName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  welcomeRole: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  kpiCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  kpiValue: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  kpiLabel: { fontSize: 10, color: '#999', marginTop: 2, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 8, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1A1C1E' },
  targetPct: { fontSize: 20, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  targetDetail: { fontSize: 11, color: '#666', marginTop: 6 },
  targetHint: { fontSize: 10, color: '#999', marginTop: 2 },
  bonusValue: { fontSize: 28, fontWeight: 'bold', color: '#0052CC' },
  bonusSub: { fontSize: 14, color: '#999', fontWeight: 'normal' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1A1C1E', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#1A1C1E' },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getIMFTTasks, getBMFTTasks } from '../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const STATUS_COLOR: any = { Assigned: '#4527A0', 'In Progress': '#283593', 'Pending Approval': '#F57F17', Completed: '#1B5E20', Cancelled: '#B71C1C' };

export default function JobListScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.app.user);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = user?.department === 'BMFT' ? await getBMFTTasks() : await getIMFTTasks();
      setTasks(data);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = filtered.filter(t => t.date === today);
  const otherTasks = filtered.filter(t => t.date !== today);

  const renderJob = ({ item }: any) => (
    <TouchableOpacity style={[s.jobCard, item.status === 'Pending Approval' && { borderLeftColor: '#F57F17', borderLeftWidth: 4 }, item.status === 'Completed' && { borderLeftColor: '#006D3B', borderLeftWidth: 4 }]}
      onPress={() => navigation.navigate('JobDetail', { task: item })}>
      <View style={s.jobHeader}>
        <Text style={s.jobId}>{item.task_id}</Text>
        <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status] || '#999'}20` }]}>
          <Text style={[s.statusText, { color: STATUS_COLOR[item.status] || '#999' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={s.jobType}>{item.task_type || 'Service'}</Text>
      <Text style={s.customerName}>{item.customer_name || 'Customer'}</Text>
      <View style={s.jobMeta}>
        <View style={s.metaItem}><Ionicons name="location-outline" size={12} color="#666" /><Text style={s.metaText}>{item.township || item.location || '-'}</Text></View>
        {item.customer_phone && <View style={s.metaItem}><Ionicons name="call-outline" size={12} color="#666" /><Text style={s.metaText}>{item.customer_phone}</Text></View>}
      </View>
      {item.source_ticket && <Text style={s.ticketRef}>Ticket: {item.source_ticket}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Filters */}
      <FlatList horizontal data={['all', 'Assigned', 'In Progress', 'Pending Approval', 'Completed']}
        renderItem={({ item: f }) => (
          <TouchableOpacity onPress={() => setFilter(f)} style={[s.filterChip, filter === f && s.filterActive]}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f === 'all' ? 'All' : f}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={i => i} style={s.filterRow} showsHorizontalScrollIndicator={false} />

      <FlatList
        data={todayTasks.length > 0 ? todayTasks : filtered}
        renderItem={renderJob}
        keyExtractor={item => item.task_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0052CC" />}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={todayTasks.length > 0 ? <Text style={s.sectionHeader}>Today's Jobs ({todayTasks.length})</Text> : null}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="clipboard-outline" size={48} color="#CCC" /><Text style={s.emptyText}>No jobs found</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  filterRow: { maxHeight: 48, paddingHorizontal: 12, paddingTop: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', marginRight: 6, borderWidth: 1, borderColor: '#E0E0E0' },
  filterActive: { backgroundColor: '#0052CC', borderColor: '#0052CC' },
  filterText: { fontSize: 12, fontWeight: '500', color: '#666' },
  filterTextActive: { color: '#FFF' },
  sectionHeader: { fontSize: 14, fontWeight: '600', color: '#1A1C1E', marginBottom: 8 },
  jobCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobId: { fontSize: 12, fontWeight: 'bold', color: '#0052CC' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  jobType: { fontSize: 11, color: '#666', marginBottom: 2 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#1A1C1E', marginBottom: 4 },
  jobMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#666' },
  ticketRef: { fontSize: 10, color: '#0052CC', marginTop: 6 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
});

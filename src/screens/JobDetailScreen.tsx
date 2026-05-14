import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateIMFTTask, getInventory } from '../utils/api';

const STATUS_COLOR: any = { Assigned: '#4527A0', 'In Progress': '#283593', 'Pending Approval': '#F57F17', Completed: '#1B5E20' };

export default function JobDetailScreen({ route, navigation }: any) {
  const { task } = route.params;
  const [status, setStatus] = useState(task.status);
  const [workNotes, setWorkNotes] = useState('');
  const [powerReading, setPowerReading] = useState('');
  const [custPhone, setCustPhone] = useState(task.customer_phone || '');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState(task.address || '');
  const [loading, setLoading] = useState(false);

  const startJob = async () => {
    setLoading(true);
    try {
      await updateIMFTTask(task.task_id, { status: 'In Progress', check_in_time: new Date().toISOString(), check_in_gps: 'Mobile App' });
      setStatus('In Progress');
      Alert.alert('Started', 'Job marked as In Progress');
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const submitReport = async () => {
    if (!workNotes.trim()) { Alert.alert('Error', 'Add work notes before submitting'); return; }
    setLoading(true);
    const pwr = powerReading ? { receive_power: powerReading, in_range: parseFloat(powerReading) >= -25 && parseFloat(powerReading) <= -18, signal_status: (parseFloat(powerReading) >= -25 && parseFloat(powerReading) <= -18) ? 'Good' : 'Out of Range' } : {};
    try {
      await updateIMFTTask(task.task_id, {
        status: 'Pending Approval',
        work_notes: workNotes,
        power_test: pwr,
        customer_verify: { phone: custPhone, house_no: houseNo, street },
      });
      setStatus('Pending Approval');
      Alert.alert('Submitted', 'Report sent to NOC for approval. You cannot mark this job completed yourself.');
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const callCustomer = () => { if (task.customer_phone) Linking.openURL(`tel:${task.customer_phone}`); };
  const navigateToLocation = () => {
    const lat = 16.84; const lng = 96.12; // Would use actual GPS from task
    Linking.openURL(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`);
  };

  return (
    <ScrollView style={s.container}>
      {/* Job Header */}
      <View style={s.headerCard}>
        <View style={s.headerRow}>
          <Text style={s.taskId}>{task.task_id}</Text>
          <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLOR[status] || '#999'}20` }]}>
            <Text style={[s.statusText, { color: STATUS_COLOR[status] || '#999' }]}>{status}</Text>
          </View>
        </View>
        <Text style={s.taskType}>{task.task_type || 'Service Job'}</Text>
        {(task.customer_id || task.pppoe_username) ? (
          <View style={s.pppoeBox}>
            <Text style={s.pppoeText}>{task.customer_id || task.pppoe_username}</Text>
          </View>
        ) : (
          <Text style={s.customerName}>{task.customer_name || 'Customer'}</Text>
        )}
        <View style={s.infoRow}><Ionicons name="location" size={14} color="#666" /><Text style={s.infoText}>{task.township || ''} {task.address || ''}</Text></View>
        <View style={s.infoRow}><Ionicons name="call" size={14} color="#666" /><Text style={s.infoText}>{task.customer_phone || '-'}</Text></View>
        {task.source_ticket && <View style={s.infoRow}><Ionicons name="ticket" size={14} color="#0052CC" /><Text style={[s.infoText, { color: '#0052CC' }]}>Ticket: {task.source_ticket}</Text></View>}
      </View>

      {/* Quick Actions */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#E3F2FD' }]} onPress={callCustomer}>
          <Ionicons name="call" size={20} color="#0052CC" /><Text style={[s.actionText, { color: '#0052CC' }]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#E8F5E9' }]} onPress={navigateToLocation}>
          <Ionicons name="navigate" size={20} color="#006D3B" /><Text style={[s.actionText, { color: '#006D3B' }]}>Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="camera" size={20} color="#E65100" /><Text style={[s.actionText, { color: '#E65100' }]}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#EDE7F6' }]} onPress={() => navigation.navigate('ONUBind', { task })}>
          <Ionicons name="hardware-chip" size={20} color="#5E35B1" /><Text style={[s.actionText, { color: '#5E35B1' }]}>ONU Bind</Text>
        </TouchableOpacity>
      </View>

      {/* Status Actions */}
      {status === 'Assigned' && (
        <TouchableOpacity style={s.startBtn} onPress={startJob} disabled={loading}>
          <Ionicons name="play-circle" size={22} color="#FFF" /><Text style={s.startBtnText}>{loading ? 'Starting...' : 'Start Job (Check In)'}</Text>
        </TouchableOpacity>
      )}

      {/* Report Form (In Progress) */}
      {status === 'In Progress' && (
        <View style={s.reportCard}>
          <Text style={s.reportTitle}>Job Completion Report</Text>

          <Text style={s.fieldLabel}>Customer Verification</Text>
          <TextInput value={custPhone} onChangeText={setCustPhone} placeholder="Phone Number" style={s.input} keyboardType="phone-pad" />
          <View style={s.row}>
            <TextInput value={houseNo} onChangeText={setHouseNo} placeholder="House No" style={[s.input, { flex: 1 }]} />
            <TextInput value={street} onChangeText={setStreet} placeholder="Street" style={[s.input, { flex: 2 }]} />
          </View>

          <Text style={s.fieldLabel}>Power Test (dBm)</Text>
          <Text style={s.hint}>Standard: -18 to -25 dBm</Text>
          <TextInput value={powerReading} onChangeText={setPowerReading} placeholder="-22.5" style={[s.input, { textAlign: 'center', fontSize: 22, fontWeight: 'bold' }]} keyboardType="numeric" />

          <Text style={s.fieldLabel}>Work Notes *</Text>
          <TextInput value={workNotes} onChangeText={setWorkNotes} placeholder="Describe work performed..." style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]} multiline />

          <View style={s.warningBox}>
            <Ionicons name="information-circle" size={16} color="#F57F17" />
            <Text style={s.warningText}>Report will be sent to NOC for approval. You cannot self-complete.</Text>
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={submitReport} disabled={loading}>
            <Text style={s.submitBtnText}>{loading ? 'Submitting...' : 'Submit for NOC Approval'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pending/Completed Status */}
      {status === 'Pending Approval' && (
        <View style={s.pendingCard}><Ionicons name="hourglass" size={32} color="#F57F17" /><Text style={s.pendingText}>Awaiting NOC Approval</Text><Text style={s.pendingSub}>Your report has been submitted. NOC will review and approve.</Text></View>
      )}
      {status === 'Completed' && (
        <View style={s.doneCard}><Ionicons name="checkmark-circle" size={32} color="#006D3B" /><Text style={s.doneText}>Job Completed & Approved</Text></View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  headerCard: { backgroundColor: '#FFF', margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskId: { fontSize: 14, fontWeight: 'bold', color: '#0052CC' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  taskType: { fontSize: 12, color: '#666', marginBottom: 4 },
  customerName: { fontSize: 18, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 8 },
  pppoeBox: { backgroundColor: '#E3F2FD', borderColor: '#90CAF9', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 8 },
  pppoeText: { fontSize: 14, fontWeight: 'bold', color: '#1565C0' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { fontSize: 13, color: '#666' },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  actionBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '600' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0052CC', marginHorizontal: 16, borderRadius: 24, padding: 16, marginTop: 8 },
  startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  reportCard: { backgroundColor: '#FFF', margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  reportTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginTop: 12, marginBottom: 4 },
  hint: { fontSize: 10, color: '#999', marginBottom: 4 },
  input: { backgroundColor: '#F5F6F8', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8E1', borderRadius: 8, padding: 10, marginTop: 12 },
  warningText: { flex: 1, fontSize: 11, color: '#F57F17' },
  submitBtn: { backgroundColor: '#E65100', borderRadius: 24, padding: 16, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  pendingCard: { alignItems: 'center', backgroundColor: '#FFF8E1', margin: 16, borderRadius: 12, padding: 24 },
  pendingText: { fontSize: 16, fontWeight: 'bold', color: '#F57F17', marginTop: 8 },
  pendingSub: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
  doneCard: { alignItems: 'center', backgroundColor: '#E8F5E9', margin: 16, borderRadius: 12, padding: 24 },
  doneText: { fontSize: 16, fontWeight: 'bold', color: '#006D3B', marginTop: 8 },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const API_BASE = 'https://erp.myanmarlink.online/api';

const PHOTO_LABELS: { key: string; label: string }[] = [
  { key: 'box_overview', label: '1. Box Overview Photo' },
  { key: 'splitter_overview', label: '2. Splitter Overview Photo' },
  { key: 'box_dbm', label: '3. Box DBM Photo' },
  { key: 'user_port', label: '4. User Port Photo' },
  { key: 'home_dbm', label: '5. Home DBM Photo' },
  { key: 'speed_test', label: '6. Speed Test Photo' },
  { key: 'onu_loss', label: '7. ONU Loss Photo' },
  { key: 'onu_sn_photo', label: '8. ONU SN Photo' },
  { key: 'onu_mounting', label: '9. ONU Mounting Overview Photo' },
  { key: 'contract', label: '10. Contract' },
  { key: 'nrc', label: '11. NRC' },
];

interface ONUBindScreenProps {
  route: any;
  navigation: any;
}

export default function ONUBindScreen({ route, navigation }: ONUBindScreenProps) {
  const { task } = route.params || {};
  const user = useSelector((state: RootState) => state.app.user);
  const token = useSelector((state: RootState) => state.app.token);

  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    engineer_name: user?.name || '',
    user_id: task?.customer_id || '',
    customer_name: task?.customer_name || '',
    cus_phone: task?.customer_phone || '',
    cus_address: task?.address || '',
    brand_name: task?.brand || '',
    bandwidth: '',
    mbps_plan: task?.package || '',
    odb_name: '',
    odb_location: '',
    cus_location: '',
    odb_losses: '',
    home_losses: '',
    use_port_no: '',
    total_port: '',
    available_port: '',
    fiber_meter: '',
    onu_sn: '',
    remark: '',
  });

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const pickPhoto = async (photoKey: string) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const camStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (camStatus.status !== 'granted') {
          Alert.alert('Permission needed', 'Camera or gallery permission is required');
          return;
        }
      }
      Alert.alert(
        'Select Photo',
        `Choose source for: ${PHOTO_LABELS.find(p => p.key === photoKey)?.label}`,
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                base64: true,
              });
              if (!result.canceled && result.assets[0]) {
                setPhotos(prev => ({ ...prev, [photoKey]: result.assets[0].uri }));
              }
            }
          },
          {
            text: 'Gallery',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                base64: true,
              });
              if (!result.canceled && result.assets[0]) {
                setPhotos(prev => ({ ...prev, [photoKey]: result.assets[0].uri }));
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const uploadPhoto = async (uri: string, key: string): Promise<string> => {
    try {
      const formData = new FormData();
      const filename = `onu_${key}_${Date.now()}.jpg`;
      formData.append('file', {
        uri,
        name: filename,
        type: 'image/jpeg',
      } as any);
      formData.append('category', 'onu_bind');
      formData.append('key', key);

      const res = await fetch(`${API_BASE}/upload/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.url || uri;
      }
      return uri;
    } catch {
      return uri;
    }
  };

  const submitForm = async () => {
    // Validate required fields
    const required = ['engineer_name', 'user_id', 'customer_name', 'cus_phone', 'odb_name', 'onu_sn'];
    const missing = required.filter(k => !form[k as keyof typeof form]?.trim());
    if (missing.length > 0) {
      Alert.alert('Missing Fields', `Please fill in: ${missing.join(', ')}`);
      return;
    }

    // Check required photos
    const requiredPhotos = ['box_overview', 'splitter_overview', 'box_dbm', 'user_port', 'home_dbm', 'speed_test', 'onu_loss', 'onu_sn_photo', 'onu_mounting', 'contract', 'nrc'];
    const missingPhotos = requiredPhotos.filter(k => !photos[k]);
    if (missingPhotos.length > 0) {
      Alert.alert(
        'Missing Photos',
        `Please take all required photos. Missing: ${missingPhotos.length} photos`,
        [
          { text: 'Continue Anyway', onPress: () => doSubmit() },
          { text: 'Go Back', style: 'cancel' }
        ]
      );
      return;
    }

    doSubmit();
  };

  const doSubmit = async () => {
    setLoading(true);
    try {
      // Upload photos first
      const uploadedPhotos: Record<string, string> = {};
      for (const [key, uri] of Object.entries(photos)) {
        uploadedPhotos[key] = await uploadPhoto(uri, key);
      }

      const payload = {
        ...form,
        task_id: task?.task_id || '',
        photos: uploadedPhotos,
      };

      const res = await fetch(`${API_BASE}/onu-bind/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          'Success!',
          `ONU Bind submitted successfully!\nBind ID: ${data.bind_id}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to submit ONU Bind');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const photoCount = Object.keys(photos).length;

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerIcon}>
          <Ionicons name="hardware-chip" size={24} color="#FFF" />
        </View>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>ONU Bind Form</Text>
          <Text style={s.headerSub}>
            {task?.task_id ? `Task: ${task.task_id}` : 'New ONU Bind'}
          </Text>
        </View>
      </View>

      {/* Section 1: Engineer & Customer Info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>
          <Ionicons name="person" size={14} color="#0052CC" /> Engineer & Customer Info
        </Text>

        <Text style={s.label}>1. Engineer Name *</Text>
        <TextInput
          style={s.input}
          value={form.engineer_name}
          onChangeText={v => updateField('engineer_name', v)}
          placeholder="Engineer name"
        />

        <Text style={s.label}>2. User ID *</Text>
        <TextInput
          style={s.input}
          value={form.user_id}
          onChangeText={v => updateField('user_id', v)}
          placeholder="PPPoE username / User ID"
        />

        <Text style={s.label}>3. Customer Name *</Text>
        <TextInput
          style={s.input}
          value={form.customer_name}
          onChangeText={v => updateField('customer_name', v)}
          placeholder="Customer full name"
        />

        <Text style={s.label}>4. Customer Phone *</Text>
        <TextInput
          style={s.input}
          value={form.cus_phone}
          onChangeText={v => updateField('cus_phone', v)}
          placeholder="09xxxxxxxxx"
          keyboardType="phone-pad"
        />

        <Text style={s.label}>5. Customer Address</Text>
        <TextInput
          style={[s.input, s.multiline]}
          value={form.cus_address}
          onChangeText={v => updateField('cus_address', v)}
          placeholder="Full address"
          multiline
          numberOfLines={2}
        />

        <Text style={s.label}>6. Brand Name</Text>
        <TextInput
          style={s.input}
          value={form.brand_name}
          onChangeText={v => updateField('brand_name', v)}
          placeholder="e.g. MyanmarLink, BurmaNet"
        />
      </View>

      {/* Section 2: Service Info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>
          <Ionicons name="wifi" size={14} color="#0052CC" /> Service Information
        </Text>

        <View style={s.row}>
          <View style={s.halfField}>
            <Text style={s.label}>7. Bandwidth</Text>
            <TextInput
              style={s.input}
              value={form.bandwidth}
              onChangeText={v => updateField('bandwidth', v)}
              placeholder="e.g. 25M"
            />
          </View>
          <View style={s.halfField}>
            <Text style={s.label}>8. Mbps Plan</Text>
            <TextInput
              style={s.input}
              value={form.mbps_plan}
              onChangeText={v => updateField('mbps_plan', v)}
              placeholder="e.g. ML_FTTH_25M"
            />
          </View>
        </View>
      </View>

      {/* Section 3: ODB Info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>
          <Ionicons name="git-network" size={14} color="#0052CC" /> ODB Information
        </Text>

        <Text style={s.label}>9. ODB Name *</Text>
        <TextInput
          style={s.input}
          value={form.odb_name}
          onChangeText={v => updateField('odb_name', v)}
          placeholder="ODB box name"
        />

        <Text style={s.label}>10. ODB Location</Text>
        <TextInput
          style={s.input}
          value={form.odb_location}
          onChangeText={v => updateField('odb_location', v)}
          placeholder="ODB location / GPS"
        />

        <Text style={s.label}>11. Customer Location</Text>
        <TextInput
          style={s.input}
          value={form.cus_location}
          onChangeText={v => updateField('cus_location', v)}
          placeholder="Customer GPS location"
        />

        <View style={s.row}>
          <View style={s.halfField}>
            <Text style={s.label}>12. ODB Losses</Text>
            <TextInput
              style={s.input}
              value={form.odb_losses}
              onChangeText={v => updateField('odb_losses', v)}
              placeholder="dBm"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={s.halfField}>
            <Text style={s.label}>13. Home Losses</Text>
            <TextInput
              style={s.input}
              value={form.home_losses}
              onChangeText={v => updateField('home_losses', v)}
              placeholder="dBm"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={s.row}>
          <View style={s.halfField}>
            <Text style={s.label}>14. Use Port No</Text>
            <TextInput
              style={s.input}
              value={form.use_port_no}
              onChangeText={v => updateField('use_port_no', v)}
              placeholder="Port number"
              keyboardType="number-pad"
            />
          </View>
          <View style={s.halfField}>
            <Text style={s.label}>15. Total Port</Text>
            <TextInput
              style={s.input}
              value={form.total_port}
              onChangeText={v => updateField('total_port', v)}
              placeholder="Total ports"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={s.row}>
          <View style={s.halfField}>
            <Text style={s.label}>16. Available Port</Text>
            <TextInput
              style={s.input}
              value={form.available_port}
              onChangeText={v => updateField('available_port', v)}
              placeholder="Available"
              keyboardType="number-pad"
            />
          </View>
          <View style={s.halfField}>
            <Text style={s.label}>17. Fiber Meter</Text>
            <TextInput
              style={s.input}
              value={form.fiber_meter}
              onChangeText={v => updateField('fiber_meter', v)}
              placeholder="Meters"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      {/* Section 4: ONU Info */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>
          <Ionicons name="hardware-chip" size={14} color="#0052CC" /> ONU Information
        </Text>

        <Text style={s.label}>18. ONU Serial Number *</Text>
        <TextInput
          style={s.input}
          value={form.onu_sn}
          onChangeText={v => updateField('onu_sn', v)}
          placeholder="ONU SN (e.g. HWTC1234ABCD)"
          autoCapitalize="characters"
        />

        <Text style={s.label}>19. Remark</Text>
        <TextInput
          style={[s.input, s.multiline]}
          value={form.remark}
          onChangeText={v => updateField('remark', v)}
          placeholder="Additional notes..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Section 5: Required Photos */}
      <View style={s.section}>
        <View style={s.photoHeader}>
          <Text style={s.sectionTitle}>
            <Ionicons name="camera" size={14} color="#E65100" /> Required Photos
          </Text>
          <View style={[s.photoBadge, { backgroundColor: photoCount === 11 ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={[s.photoBadgeText, { color: photoCount === 11 ? '#2E7D32' : '#E65100' }]}>
              {photoCount}/11
            </Text>
          </View>
        </View>

        {PHOTO_LABELS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[s.photoItem, photos[key] ? s.photoItemDone : s.photoItemPending]}
            onPress={() => pickPhoto(key)}
          >
            {photos[key] ? (
              <Image source={{ uri: photos[key] }} style={s.photoThumb} />
            ) : (
              <View style={s.photoPlaceholder}>
                <Ionicons name="camera-outline" size={28} color="#9E9E9E" />
              </View>
            )}
            <View style={s.photoInfo}>
              <Text style={[s.photoLabel, photos[key] && s.photoLabelDone]}>{label}</Text>
              <Text style={[s.photoStatus, { color: photos[key] ? '#2E7D32' : '#E65100' }]}>
                {photos[key] ? '✓ Photo taken' : 'Tap to take photo'}
              </Text>
            </View>
            <Ionicons
              name={photos[key] ? 'checkmark-circle' : 'add-circle-outline'}
              size={22}
              color={photos[key] ? '#2E7D32' : '#9E9E9E'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Router Bind GP Notice */}
      <View style={s.noticeCard}>
        <Ionicons name="information-circle" size={18} color="#0052CC" />
        <Text style={s.noticeText}>
          <Text style={{ fontWeight: 'bold' }}>Router Bind GP</Text> — Check with NOC before binding router
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[s.submitBtn, loading && s.submitBtnDisabled]}
        onPress={submitForm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color="#FFF" />
            <Text style={s.submitBtnText}>Submit ONU Bind Form</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#0052CC',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  section: {
    backgroundColor: '#FFF',
    margin: 12,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0052CC',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#37474F', marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  multiline: { height: 72, textAlignVertical: 'top', paddingTop: 10 },
  row: { flexDirection: 'row', gap: 8 },
  halfField: { flex: 1 },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  photoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  photoBadgeText: { fontSize: 12, fontWeight: '700' },
  photoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  photoItemPending: { borderColor: '#FFE0B2', backgroundColor: '#FFF8F0' },
  photoItemDone: { borderColor: '#C8E6C9', backgroundColor: '#F1F8E9' },
  photoThumb: { width: 52, height: 52, borderRadius: 8, marginRight: 12 },
  photoPlaceholder: {
    width: 52, height: 52, borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  photoInfo: { flex: 1 },
  photoLabel: { fontSize: 13, fontWeight: '500', color: '#37474F' },
  photoLabelDone: { color: '#2E7D32' },
  photoStatus: { fontSize: 11, marginTop: 2 },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    margin: 12,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  noticeText: { flex: 1, fontSize: 13, color: '#0052CC' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052CC',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

sequence_list = ['meas_uid',
                 'start_time',
                 'measurement_time',
                 'start_of_measurement_host_time',
                 'finish_of_measurement_host_time',
                 'start_of_measurement_mcir_time',
                 'finish_of_measurement_mcir_time',
                 'time_difference']

b1_list = ['date_and_time',
            'patient_weight',
            'patient_height',
            'patient_gender',
            'aspect_prim_name_a0',
            'factor_a0n0',
            'aspect_value_absolute_a0i0',
            'aspect_prim_name_a1',
            'factor_a1n0',
            'aspect_value_absolute_a1i0',
            'aspect_prim_name_a2',
            'factor_a2n0',
            'aspect_value_absolute_a2i0',
            'aspect_prim_name_a3',
            'factor_a3n0',
            'aspect_value_absolute_a3i0',
            'aspect_prim_name_a4',
            'factor_a4n0',
            'aspect_value_absolute_a4i0',
            'aspect_prim_name_a5',
            'factor_a5n0',
            'aspect_value_absolute_a5i0',
            'aspect_prim_name_a6',
            'factor_a6n0',
            'aspect_value_absolute_a6i0',
            'aspect_prim_name_a7',
            'factor_a7n0',
            'aspect_value_absolute_a7i0',
            'aspect_prim_name_a8',
            'factor_a8n0',
            'aspect_value_absolute_a8i0',
            'aspect_prim_name_a9',
            'factor_a9n0',
            'aspect_value_absolute_a9i0',
            'most_critical_aspect_number_name',
            'palipeakpowerforw_0',
            'palipeakpowerrefl_0',
            'palipeakpowerforw_90',
            'palipeakpowerrefl_90',
            'predicted_sed_absolute',
            'total_measurement_time_mcir',
            'protocol_name']


sed_list = ['current_sed_value',
            'sed_limit',
            'sed_threshold',
            'predicted_sed_absolute',
            'predicted_sed_rel_limit',
            'predicted_sed_rel_threshold',
            'sed_after_measurement',
            'protocol_name']


sar_list = ['nominal_b0',
            'tx_coil_serial_no',
            'coil_power_loss_cp',
            'coil_power_loss_ep',
            'avg_b1_contact_lim_cp',
            'avg_b1_contact_lim_ep',
            'avg_b1_contact_lim_error',
            'coil_sar_conv_factor',
            'exposition_factor',
            'irrad_factor_head',
            'irrad_factor_torso',
            'irrad_factor_leg',
            'kr_scaling_factor',
            'absolute_table_factor',
            'adj_power',
            'protocol_name']

abstract_list = [
    'aspect_sec_name_a0', 'aspect_limit_a0i0', 'aspect_averaging_time_a0i0', 'aspect_value_absolute_a0i0', 'aspect_value_relative_a0i0',
    'aspect_limit_a0i1', 'aspect_averaging_time_a0i1', 'aspect_value_absolute_a0i1', 'aspect_value_relative_a0i1',
    'aspect_limit_a0i2', 'aspect_averaging_time_a0i2', 'aspect_value_absolute_a0i2', 'aspect_value_relative_a0i2',
    'aspect_limit_a0i3', 'aspect_averaging_time_a0i3', 'aspect_value_absolute_a0i3', 'aspect_value_relative_a0i3',
    'aspect_sec_name_a1', 'aspect_limit_a1i0', 'aspect_averaging_time_a1i0', 'aspect_value_absolute_a1i0', 'aspect_value_relative_a1i0',
    'aspect_limit_a1i1', 'aspect_averaging_time_a1i1', 'aspect_value_absolute_a1i1', 'aspect_value_relative_a1i1',
    'aspect_limit_a1i2', 'aspect_averaging_time_a1i2', 'aspect_value_absolute_a1i2', 'aspect_value_relative_a1i2',
    'aspect_limit_a1i3', 'aspect_averaging_time_a1i3', 'aspect_value_absolute_a1i3', 'aspect_value_relative_a1i3',
    'aspect_sec_name_a2', 'aspect_limit_a2i0', 'aspect_averaging_time_a2i0', 'aspect_value_absolute_a2i0', 'aspect_value_relative_a2i0',
    'aspect_limit_a2i1', 'aspect_averaging_time_a2i1', 'aspect_value_absolute_a2i1', 'aspect_value_relative_a2i1',
    'aspect_limit_a2i2', 'aspect_averaging_time_a2i2', 'aspect_value_absolute_a2i2', 'aspect_value_relative_a2i2',
    'aspect_limit_a2i3', 'aspect_averaging_time_a2i3', 'aspect_value_absolute_a2i3', 'aspect_value_relative_a2i3',
    'aspect_sec_name_a3', 'aspect_limit_a3i0', 'aspect_averaging_time_a3i0', 'aspect_value_absolute_a3i0', 'aspect_value_relative_a3i0',
    'aspect_limit_a3i1', 'aspect_averaging_time_a3i1', 'aspect_value_absolute_a3i1', 'aspect_value_relative_a3i1',
    'aspect_limit_a3i2', 'aspect_averaging_time_a3i2', 'aspect_value_absolute_a3i2', 'aspect_value_relative_a3i2',
    'aspect_limit_a3i3', 'aspect_averaging_time_a3i3', 'aspect_value_absolute_a3i3', 'aspect_value_relative_a3i3',
    'aspect_sec_name_a4', 'aspect_limit_a4i0', 'aspect_averaging_time_a4i0', 'aspect_value_absolute_a4i0', 'aspect_value_relative_a4i0',
    'aspect_limit_a4i1', 'aspect_averaging_time_a4i1', 'aspect_value_absolute_a4i1', 'aspect_value_relative_a4i1',
    'aspect_limit_a4i2', 'aspect_averaging_time_a4i2', 'aspect_value_absolute_a4i2', 'aspect_value_relative_a4i2',
    'aspect_limit_a4i3', 'aspect_averaging_time_a4i3', 'aspect_value_absolute_a4i3', 'aspect_value_relative_a4i3',
    'aspect_sec_name_a5', 'aspect_limit_a5i0', 'aspect_averaging_time_a5i0', 'aspect_value_absolute_a5i0', 'aspect_value_relative_a5i0',
    'aspect_limit_a5i1', 'aspect_averaging_time_a5i1', 'aspect_value_absolute_a5i1', 'aspect_value_relative_a5i1',
    'aspect_limit_a5i2', 'aspect_averaging_time_a5i2', 'aspect_value_absolute_a5i2', 'aspect_value_relative_a5i2',
    'aspect_limit_a5i3', 'aspect_averaging_time_a5i3', 'aspect_value_absolute_a5i3', 'aspect_value_relative_a5i3',
    'aspect_sec_name_a6', 'aspect_limit_a6i0', 'aspect_averaging_time_a6i0', 'aspect_value_absolute_a6i0', 'aspect_value_relative_a6i0',
    'aspect_limit_a6i1', 'aspect_averaging_time_a6i1', 'aspect_value_absolute_a6i1', 'aspect_value_relative_a6i1',
    'aspect_limit_a6i2', 'aspect_averaging_time_a6i2', 'aspect_value_absolute_a6i2', 'aspect_value_relative_a6i2',
    'aspect_limit_a6i3', 'aspect_averaging_time_a6i3', 'aspect_value_absolute_a6i3', 'aspect_value_relative_a6i3',
    'aspect_sec_name_a7', 'aspect_limit_a7i0', 'aspect_averaging_time_a7i0', 'aspect_value_absolute_a7i0', 'aspect_value_relative_a7i0',
    'aspect_limit_a7i1', 'aspect_averaging_time_a7i1', 'aspect_value_absolute_a7i1', 'aspect_value_relative_a7i1',
    'aspect_limit_a7i2', 'aspect_averaging_time_a7i2', 'aspect_value_absolute_a7i2', 'aspect_value_relative_a7i2',
    'aspect_limit_a7i3', 'aspect_averaging_time_a7i3', 'aspect_value_absolute_a7i3', 'aspect_value_relative_a7i3',
    'aspect_sec_name_a8', 'aspect_limit_a8i0', 'aspect_averaging_time_a8i0', 'aspect_value_absolute_a8i0', 'aspect_value_relative_a8i0',
    'aspect_limit_a8i1', 'aspect_averaging_time_a8i1', 'aspect_value_absolute_a8i1', 'aspect_value_relative_a8i1',
    'aspect_limit_a8i2', 'aspect_averaging_time_a8i2', 'aspect_value_absolute_a8i2', 'aspect_value_relative_a8i2',
    'aspect_limit_a8i3', 'aspect_averaging_time_a8i3', 'aspect_value_absolute_a8i3', 'aspect_value_relative_a8i3',
    'aspect_sec_name_a9', 'aspect_limit_a9i0', 'aspect_averaging_time_a9i0', 'aspect_value_absolute_a9i0', 'aspect_value_relative_a9i0',
    'aspect_limit_a9i1', 'aspect_averaging_time_a9i1', 'aspect_value_absolute_a9i1', 'aspect_value_relative_a9i1',
    'aspect_limit_a9i2', 'aspect_averaging_time_a9i2', 'aspect_value_absolute_a9i2', 'aspect_value_relative_a9i2',
    'aspect_limit_a9i3', 'aspect_averaging_time_a9i3', 'aspect_value_absolute_a9i3', 'aspect_value_relative_a9i3',
    'sed_after_measurement', 'protocol_name']


# abstract_list = ['aspect_prim_name_a0',
#                  'aspect_limit_a0i0',
#                  'aspect_averaging_time_a0i0',
#                  'aspect_value_absolute_a0i0',
#                  'aspect_value_relative_a0i0',
#                  'aspect_limit_a0i1',
#                  'aspect_averaging_time_a0i1',
#                  'aspect_value_absolute_a0i1',
#                  'aspect_value_relative_a0i1',
#                  'aspect_prim_name_a1',
#                  'aspect_limit_a1i0',
#                  'aspect_averaging_time_a1i0',
#                  'aspect_value_absolute_a1i0',
#                  'aspect_value_relative_a1i0',
#                  'aspect_limit_a1i1',
#                  'aspect_averaging_time_a1i1',
#                  'aspect_value_absolute_a1i1',
#                  'aspect_value_relative_a1i1',
#                  'aspect_prim_name_a2',
#                  'aspect_limit_a2i0',
#                  'aspect_averaging_time_a2i0',
#                  'aspect_value_absolute_a2i0',
#                  'aspect_value_relative_a2i0',
#                  'aspect_limit_a2i1',
#                  'aspect_averaging_time_a2i1',
#                  'aspect_value_absolute_a2i1',
#                  'aspect_value_relative_a2i1',
#                  'head_cylinder_mass']
#


# abstract_list = ['patient_weight',
#                  'patient_registered_weight',
#                  'patient_age',
#                  'patient_height',
#                  'patient_gender',
#                  'patient_position',
#                  'superman_position',
#                  'patient_direction',
#                  'patient_kind',
#                  'head_cylinder_mass',
#                  'head_cylinder_length',
#                  'head_cylinder_radius',
#                  'torso_cylinder_mass',
#                  'torso_cylinder_length',
#                  'torso_cylinder_radius',
#                  'leg_cylinder_mass',
#                  'leg_cylinder_length',
#                  'leg_cylinder_radius',
#                  'last_examination',
#                  'current_sed_value',
#                  'sar_model_type',
#                  'sar_model_b1_ref',
#                  'head_position_relative_coil_n0',
#                  'relative_position_relative_top_of_head_n0',
#                  'absolute_table_position_n0',
#                  'data_source',
#                  'aspect_name_a0',
#                  'factor_a0_n0',
#                  'aspect_name_a1',
#                  'factor_a1_n0',
#                  'aspect_name_a2',
#                  'factor_a2_n0',
#                  'aspect_name_a3',
#                  'factor_a3_n0',
#                  'aspect_name_a4',
#                  'factor_a4_n0',
#                  'aspect_name_a5',
#                  'factor_a5_n0',
#                  'aspect_name_a6',
#                  'factor_a6_n0',
#                  'aspect_name_a7',
#                  'factor_a7_n0',
#                  'aspect_name_a8',
#                  'factor_a8_n0',
#                  'aspect_name_a9',
#                  'factor_a9_n0',
#                  'most_critical_aspect_number_name',
#                  'most_critical_sar_aspect_number_name',
#                  'bore_temperature',
#                  'calculated_pre_delay',
#                  'calculated_meas_pause',
#                  'sed_limit',
#                  'sed_threshold',
#                  'predicted_sed_absolute',
#                  'predicted_sed_rel_limit',
#                  'predicted_sed_rel_threshold',
#                  'aspect_name_a0',
#                  'aspect_limit_a0_i0',
#                  'aspect_averaging_time_a0_i0',
#                  'aspect_value_absolute_a0_i0',
#                  'aspect_value_relative_a0_i0',
#                  'aspect_limit_a0_i1',
#                  'aspect_averaging_time_a0_i1',
#                  'aspect_value_absolute_a0_i1',
#                  'aspect_value_relative_a0_i1',
#                  'aspect_name_a1',
#                  'aspect_limit_a1_i0',
#                  'aspect_averaging_time_a1_i0',
#                  'aspect_value_absolute_a1_i0',
#                  'aspect_value_relative_a1_i0',
#                  'aspect_limit_a1_i1',
#                  'aspect_averaging_time_a1_i0',
#                  'aspect_value_absolute_a1_i1',
#                  'aspect_value_relative_a1_i1',
#                  'aspect_name_a2',
#                  'aspect_limit_a2_i0',
#                  'aspect_averaging_time_a2_i0',
#                  'aspect_value_absolute_a2_i0',
#                  'aspect_value_relative_a2_i0',
#                  'aspect_limit_a2_i1',
#                  'aspect_averaging_time_a2_i0',
#                  'aspect_value_absolute_a2_i1',
#                  'aspect_value_relative_a2_i1',
#                  'aspect_name_a3',
#                  'aspect_limit_a3_i0',
#                  'aspect_averaging_time_a3_i0',
#                  'aspect_value_absolute_a3_i0',
#                  'aspect_value_relative_a3_i0',
#                  'aspect_limit_a3_i1',
#                  'aspect_averaging_time_a3_i0',
#                  'aspect_value_absolute_a3_i1',
#                  'aspect_value_relative_a3_i1',
#                  'aspect_name_a4',
#                  'aspect_limit_a4_i0',
#                  'aspect_averaging_time_a4_i0',
#                  'aspect_value_absolute_a4_i0',
#                  'aspect_value_relative_a4_i0',
#                  'aspect_limit_a4_i1',
#                  'aspect_averaging_time_a4_i0',
#                  'aspect_value_absolute_a4_i1',
#                  'aspect_value_relative_a4_i1',
#                  'aspect_name_a5',
#                  'aspect_limit_a5_i0',
#                  'aspect_averaging_time_a5_i0',
#                  'aspect_value_absolute_a5_i0',
#                  'aspect_value_relative_a5_i0',
#                  'aspect_limit_a5_i1',
#                  'aspect_averaging_time_a5_i0',
#                  'aspect_value_absolute_a5_i1',
#                  'aspect_value_relative_a5_i1',
#                  'aspect_name_a6',
#                  'aspect_limit_a6_i0',
#                  'aspect_averaging_time_a6_i0',
#                  'aspect_value_absolute_a6_i0',
#                  'aspect_value_relative_a6_i0',
#                  'aspect_limit_a6_i1',
#                  'aspect_averaging_time_a6_i0',
#                  'aspect_value_absolute_a6_i1',
#                  'aspect_value_relative_a6_i1',
#                  'aspect_name_a7',
#                  'aspect_limit_a7_i0',
#                  'aspect_averaging_time_a7_i0',
#                  'aspect_value_absolute_a7_i0',
#                  'aspect_value_relative_a7_i0',
#                  'aspect_limit_a7_i1',
#                  'aspect_averaging_time_a7_i0',
#                  'aspect_value_absolute_a7_i1',
#                  'aspect_value_relative_a7_i1',
#                  'aspect_name_a8',
#                  'aspect_limit_a8_i0',
#                  'aspect_averaging_time_a8_i0',
#                  'aspect_value_absolute_a8_i0',
#                  'aspect_value_relative_a8_i0',
#                  'aspect_limit_a8_i1',
#                  'aspect_averaging_time_a8_i0',
#                  'aspect_value_absolute_a8_i1',
#                  'aspect_value_relative_a8_i1',
#                  'aspect_name_a9',
#                  'aspect_limit_a9_i0',
#                  'aspect_averaging_time_a9_i0',
#                  'aspect_value_absolute_a9_i0',
#                  'aspect_value_relative_a9_i0',
#                  'aspect_limit_a9_i1',
#                  'aspect_averaging_time_a9_i1',
#                  'aspect_value_absolute_a9_i1',
#                  'aspect_value_relative_a9_i1',
#                  'sed_after_measurement',
#                  'protocol_name']

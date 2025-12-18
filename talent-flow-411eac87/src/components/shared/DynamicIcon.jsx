
import React from 'react';
import { Archive, Scale, Users, Handshake, GaugeCircle, Folder, AlertCircle, Cpu } from 'lucide-react';

const iconMap = {
  Archive,
  Scale,
  Users,
  Handshake,
  GaugeCircle,
  Folder,
  Cpu
};

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || AlertCircle;
  return <IconComponent {...props} />;
};

export default DynamicIcon;

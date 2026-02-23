/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  User, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Ship, 
  Hotel, 
  Umbrella, 
  Share2, 
  FileText, 
  LogOut,
  Plus,
  Search,
  Verified,
  AlertTriangle,
  Clock,
  Edit2,
  Trash2,
  X,
  Gift,
  Flag
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Task, UserProfile, Certification, RotationType } from './types';

// Mock Data
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Verificar documentos',
    description: 'Passaporte e Certificações BOSIET',
    category: 'pre-boarding',
    completed: true,
  },
  {
    id: '2',
    title: 'Arrumar malas offshore',
    description: 'Incluir EPI obrigatório e roupas quentes',
    category: 'pre-boarding',
    completed: false,
    dueDate: '2026-02-12',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Triagem COVID pré-voo',
    description: 'Necessário 24h antes do embarque',
    category: 'pre-boarding',
    completed: false,
    dueDate: '2026-02-13',
  },
  {
    id: '4',
    title: 'Organizar transfer aeroporto',
    description: 'Confirmar pick-up com equipe de logística',
    category: 'pre-boarding',
    completed: false,
    dueDate: '2026-02-14',
  },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'João Silva',
  role: 'Plataformista',
  email: 'joao.silva@offshore-pro.com',
  employeeId: 'OFF-8842-BR',
  phone: '+55 21 99876-5432',
  rotationType: '14x14',
  nextBoarding: '2026-02-24',
};

const CERTIFICATIONS: Certification[] = [
  { id: '1', name: 'BOSIET', expiryDate: 'Dez 2027', status: 'valid' },
  { id: '2', name: 'HUET', expiryDate: 'Jan 2028', status: 'valid' },
  { id: '3', name: 'NR-37', expiryDate: 'Out 2026', status: 'valid' },
];

const HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'Confraternização Universal' },
  { date: '2026-02-17', name: 'Carnaval' },
  { date: '2026-04-03', name: 'Sexta-feira Santa' },
  { date: '2026-04-21', name: 'Tiradentes' },
  { date: '2026-05-01', name: 'Dia do Trabalho' },
  { date: '2026-06-04', name: 'Corpus Christi' },
  { date: '2026-09-07', name: 'Independência do Brasil' },
  { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
  { date: '2026-11-02', name: 'Finados' },
  { date: '2026-11-15', name: 'Proclamação da República' },
  { date: '2026-11-20', name: 'Consciência Negra' },
  { date: '2026-12-25', name: 'Natal' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks' | 'profile'>('schedule');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [certifications, setCertifications] = useState<Certification[]>(CERTIFICATIONS);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: (() => void) | null }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Tarefa',
      message: 'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        setTasks(prev => prev.filter(t => t.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const saveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || '',
        description: taskData.description || '',
        category: 'pre-boarding',
        completed: false,
        dueDate: taskData.dueDate,
        priority: taskData.priority as any,
      };
      setTasks(prev => [...prev, newTask]);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const deleteCert = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Certificação',
      message: 'Tem certeza que deseja excluir esta certificação? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        setCertifications(prev => prev.filter(c => c.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const saveCert = (certData: Partial<Certification>) => {
    if (editingCert) {
      setCertifications(prev => prev.map(c => c.id === editingCert.id ? { ...c, ...certData } as Certification : c));
    } else {
      const newCert: Certification = {
        id: Math.random().toString(36).substr(2, 9),
        name: certData.name || '',
        expiryDate: certData.expiryDate || '',
        status: certData.status || 'valid',
      };
      setCertifications(prev => [...prev, newCert]);
    }
    setIsCertModalOpen(false);
    setEditingCert(null);
  };

  const openEditCertModal = (cert: Certification) => {
    setEditingCert(cert);
    setIsCertModalOpen(true);
  };

  const exportSchedulePDF = () => {
    const doc = new jsPDF();
    const config = getRotationConfig(profile.rotationType);
    
    doc.setFontSize(18);
    doc.text(`Escala Offshore - ${profile.name}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Tipo de Rotação: ${profile.rotationType}`, 14, 30);
    doc.text(`Próximo Embarque: ${new Date(profile.nextBoarding + 'T00:00:00').toLocaleDateString('pt-BR')}`, 14, 35);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 40);

    let startY = 50;
    const monthsToExport = 6;
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    for (let i = 0; i < monthsToExport; i++) {
      const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthName = monthDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (startY > 240) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(14);
      doc.text(monthName.toUpperCase(), 14, startY);
      startY += 5;

      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const tableData = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
        const status = getDayStatus(date);
        const statusLabel = status === 'on' ? 'EMBARCADO' : status === 'pre' ? 'PRÉ-EMBARQUE' : 'FOLGA';
        
        tableData.push([
          d.toString().padStart(2, '0'),
          date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          statusLabel
        ]);
      }

      autoTable(doc, {
        startY: startY,
        head: [['Dia', 'Semana', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // primary color roughly
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const status = data.cell.raw;
            if (status === 'EMBARCADO') data.cell.styles.fontStyle = 'bold';
            if (status === 'PRÉ-EMBARQUE') data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { bottom: 20 }
      });

      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    doc.save(`Escala_${profile.name.replace(/\s+/g, '_')}.pdf`);
  };

  const getRotationConfig = (type: RotationType) => {
    const [on, off] = type.split('x').map(Number);
    return { on, off, total: on + off };
  };

  const getDayStatus = (date: Date): 'on' | 'off' | 'pre' => {
    const anchor = new Date(profile.nextBoarding + 'T00:00:00');
    const config = getRotationConfig(profile.rotationType);
    
    // Normalize dates to midnight for comparison
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
    
    const diffTime = d1.getTime() - d2.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate position in cycle
    let cyclePos = diffDays % config.total;
    if (cyclePos < 0) cyclePos += config.total;
    
    if (cyclePos === config.total - 1) return 'pre';
    if (cyclePos >= 0 && cyclePos < config.on) return 'on';
    return 'off';
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    
    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const status = getDayStatus(date);
      days.push(<CalendarDay key={d} day={d} type={status} />);
    }
    
    return days;
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl relative overflow-hidden">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 space-y-4"
            >
              <Header title="Escala de Trabalho" />
              
              {/* Configuration Card */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Configuração de Turno</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Rotação</label>
                    <div className="relative">
                      <select 
                        value={profile.rotationType}
                        onChange={(e) => setProfile({...profile, rotationType: e.target.value as RotationType})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-2 px-3 appearance-none focus:ring-primary outline-none"
                      >
                        <option value="14x14">14x14 Dias</option>
                        <option value="14x21">14x21 Dias</option>
                        <option value="21x21">21x21 Dias</option>
                        <option value="28x28">28x28 Dias</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Próximo Embarque</label>
                    <input 
                      type="date" 
                      value={profile.nextBoarding}
                      onChange={(e) => setProfile({...profile, nextBoarding: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-2 px-3 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Upcoming Rotation Card */}
              <section className="relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg shadow-primary/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Ship size={80} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div>
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Próxima Rotação</p>
                    <h2 className="text-white text-2xl font-bold">
                      {new Date(profile.nextBoarding + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - 
                      {(() => {
                        const end = new Date(profile.nextBoarding + 'T00:00:00');
                        const config = getRotationConfig(profile.rotationType);
                        end.setDate(end.getDate() + config.on);
                        return end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                      })()}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] uppercase font-bold">Pré-Embarque</span>
                      <span className="text-white font-medium text-sm">
                        {(() => {
                          const pre = new Date(profile.nextBoarding + 'T00:00:00');
                          pre.setDate(pre.getDate() - 1);
                          return pre.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                        })()} (Hotel)
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] uppercase font-bold">Desembarque</span>
                      <span className="text-white font-medium text-sm">
                        {(() => {
                          const end = new Date(profile.nextBoarding + 'T00:00:00');
                          const config = getRotationConfig(profile.rotationType);
                          end.setDate(end.getDate() + config.on);
                          return end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Calendar */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => changeMonth(-1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h4 className="font-bold capitalize">{monthName}</h4>
                  <button 
                    onClick={() => changeMonth(1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-7 text-center p-2 text-[10px] font-bold text-slate-400 uppercase">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 p-1">
                  {renderCalendarDays()}
                </div>
                {/* Legend */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-6 justify-center border-t border-slate-100 dark:border-slate-800">
                  <LegendItem color="bg-primary/20 border-primary" label="Embarcado" />
                  <LegendItem color="bg-amber-500/20 border-amber-500" label="Pré-Embarque" />
                  <LegendItem color="bg-emerald-500/20 border-emerald-500" label="Folga" />
                </div>
              </section>

              {/* National Holidays Card */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Flag size={18} />
                    </div>
                    <h3 className="text-sm font-bold">Feriados Nacionais 2026</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brasil</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                  {HOLIDAYS_2026.map((holiday, idx) => {
                    const date = new Date(holiday.date + 'T00:00:00');
                    const isPast = date < new Date();
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isPast 
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-50' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-xl flex flex-col items-center justify-center ${
                            isPast ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : 'bg-primary/10 text-primary'
                          }`}>
                            <span className="text-[10px] font-bold uppercase leading-none">{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-lg font-bold leading-none mt-0.5">{date.getDate()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold">{holiday.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{date.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                          </div>
                        </div>
                        {!isPast && <Gift size={14} className="text-rose-400" />}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="flex gap-3">
                <button 
                  onClick={exportSchedulePDF}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                >
                  <FileText size={18} />
                  <span>Exportar PDF</span>
                </button>
                <button className="flex items-center justify-center size-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400">
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="text-primary" />
                  <h1 className="text-xl font-bold">Tarefas de Turno</h1>
                </div>
                <div className="flex gap-2">
                  <button className="size-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800"><Search size={18} /></button>
                  <button className="size-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800"><User size={18} /></button>
                </div>
              </div>

              {/* Progress */}
              <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Prontidão para Embarque</span>
                  <span className="text-xs font-bold text-primary">65%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: '65%' }}></div>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Próximas Tarefas</h2>
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`group flex items-center gap-4 rounded-2xl p-4 shadow-sm border transition-all ${
                      task.completed 
                        ? 'bg-white/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50'
                    }`}
                  >
                    <div 
                      onClick={() => toggleTask(task.id)}
                      className={`size-6 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        task.completed ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {task.completed && <Verified size={14} />}
                    </div>
                    <div className="flex-1" onClick={() => toggleTask(task.id)}>
                      <p className={`text-sm font-bold ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                      <p className="text-xs text-slate-500">{task.description}</p>
                      <div className="mt-2 flex gap-2">
                        {task.completed ? (
                          <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                            Concluído
                          </span>
                        ) : (
                          <>
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-[8px] font-bold text-orange-500 uppercase bg-orange-500/10 px-2 py-0.5 rounded">
                                <Clock size={10} /> Até {task.dueDate.split('-').reverse().slice(0, 2).join('/')}
                              </span>
                            )}
                            {task.priority === 'high' && (
                              <span className="flex items-center gap-1 text-[8px] font-bold text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded">
                                <AlertTriangle size={10} /> Alta Prioridade
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                        className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                className="fixed bottom-24 right-6 size-14 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-105 transition-transform"
              >
                <Plus size={28} />
              </button>

              <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} 
                onSave={saveTask} 
                task={editingTask} 
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="p-4 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Perfil</h1>
                <button 
                  onClick={() => {
                    alert('Perfil salvo com sucesso!');
                  }}
                  className="text-primary font-bold text-sm hover:opacity-80 transition-opacity"
                >
                  Salvar
                </button>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <div className="size-24 rounded-full border-4 border-primary/20 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img src="https://picsum.photos/seed/joao/200/200" alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-background-light dark:border-background-dark">
                    <Plus size={16} />
                  </button>
                </div>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="text-xl font-bold bg-transparent border-none text-center focus:ring-0 outline-none w-full"
                />
                <input 
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  className="text-slate-500 font-medium bg-transparent border-none text-center focus:ring-0 outline-none w-full"
                />
              </div>

              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <ProfileField 
                      label="E-mail" 
                      value={profile.email} 
                      onChange={(val) => setProfile({...profile, email: val})}
                    />
                    <ProfileField 
                      label="ID do Funcionário" 
                      value={profile.employeeId} 
                      onChange={(val) => setProfile({...profile, employeeId: val})}
                    />
                    <ProfileField 
                      label="Telefone" 
                      value={profile.phone} 
                      onChange={(val) => setProfile({...profile, phone: val})}
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Certificações</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {certifications.map(cert => (
                      <div 
                        key={cert.id} 
                        onClick={() => openEditCertModal(cert)}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2 cursor-pointer hover:border-primary/50 transition-all relative group"
                      >
                        <div className={`size-10 rounded-full flex items-center justify-center ${
                          cert.status === 'valid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {cert.status === 'valid' ? <Verified size={20} /> : <AlertTriangle size={20} />}
                        </div>
                        <p className="text-xs font-bold">{cert.name}</p>
                        <p className="text-[10px] text-slate-500">Exp: {cert.expiryDate}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCert(cert.id); }}
                          className="absolute -top-2 -right-2 size-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <div 
                      onClick={() => { setEditingCert(null); setIsCertModalOpen(true); }}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-1 opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                    >
                      <Plus size={20} className="text-slate-400" />
                      <p className="text-[10px] font-bold">Adicionar</p>
                    </div>
                  </div>
                </section>

                <CertModal 
                  isOpen={isCertModalOpen}
                  onClose={() => { setIsCertModalOpen(false); setEditingCert(null); }}
                  onSave={saveCert}
                  cert={editingCert}
                />

                <button 
                  onClick={() => {
                    if (window.confirm('Deseja realmente sair?')) {
                      alert('Sessão encerrada.');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-rose-500/10 text-rose-500 font-bold rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm || (() => {})}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 pb-8 pt-3 flex justify-between items-center z-50">
        <NavItem 
          active={activeTab === 'schedule'} 
          onClick={() => setActiveTab('schedule')} 
          icon={<CalendarIcon size={22} />} 
          label="Agenda" 
        />
        <NavItem 
          active={activeTab === 'tasks'} 
          onClick={() => setActiveTab('tasks')} 
          icon={<CheckSquare size={22} />} 
          label="Tarefas" 
        />
        <NavItem 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<User size={22} />} 
          label="Perfil" 
        />
      </nav>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
        <CalendarIcon size={20} />
      </div>
      <h1 className="text-lg font-bold">{title}</h1>
      <button className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <Bell size={20} />
      </button>
    </div>
  );
}

function CalendarDay({ day, type }: { day: number, type: 'on' | 'off' | 'pre', key?: any }) {
  const styles = {
    on: 'bg-primary/10 text-primary border-primary/30',
    off: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    pre: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
  };
  
  const icons = {
    on: <Ship size={10} />,
    off: <Umbrella size={10} />,
    pre: <Hotel size={10} />
  };

  return (
    <div className={`aspect-square flex flex-col items-center justify-center rounded-xl border m-0.5 ${styles[type]}`}>
      <span className="text-xs font-bold">{day}</span>
      <span className="mt-0.5">{icons[type]}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`size-4 rounded-md border-2 ${color}`}></div>
      <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function ProfileField({ label, value, onChange }: { label: string, value: string, onChange?: (val: string) => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 focus-within:border-primary transition-colors">
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none"
      />
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-slate-400'}`}
    >
      <div className="h-8 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onClose }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="size-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TaskModal({ isOpen, onClose, onSave, task }: { isOpen: boolean, onClose: () => void, onSave: (data: Partial<Task>) => void, task: Task | null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.dueDate || '');
      setPriority(task.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-6 space-y-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Título</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Verificar EPIs"
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3 px-4 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Descrição</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3 px-4 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Limite</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3 px-4 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Prioridade</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3 px-4 focus:ring-primary outline-none appearance-none"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onSave({ title, description, dueDate, priority })}
          disabled={!title}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {task ? 'Salvar Alterações' : 'Criar Tarefa'}
        </button>
      </motion.div>
    </div>
  );
}

function CertModal({ isOpen, onClose, onSave, cert }: { isOpen: boolean, onClose: () => void, onSave: (data: Partial<Certification>) => void, cert: Certification | null }) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<'valid' | 'expiring' | 'expired'>('valid');

  useEffect(() => {
    if (cert) {
      setName(cert.name);
      setExpiryDate(cert.expiryDate);
      setStatus(cert.status);
    } else {
      setName('');
      setExpiryDate('');
      setStatus('valid');
    }
  }, [cert, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-6 space-y-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{cert ? 'Editar Certificação' : 'Nova Certificação'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nome da Certificação</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: BOSIET"
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3 px-4 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento</label>
              <input 
                type="text" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="Ex: Dez 2027"
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3 px-4 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3 px-4 focus:ring-primary outline-none appearance-none"
              >
                <option value="valid">Válido</option>
                <option value="expiring">Expirando</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onSave({ name, expiryDate, status })}
          disabled={!name}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {cert ? 'Salvar Alterações' : 'Adicionar Certificação'}
        </button>
      </motion.div>
    </div>
  );
}

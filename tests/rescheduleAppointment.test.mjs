import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareReschedule, rescheduleSlotStatus, canReschedule } from '../src/utils/rescheduleAppointment.js'
import { findSlotConflict } from '../src/utils/appointmentSlots.js'
const NOW = new Date('2026-11-05T12:00:00')
const base = [
  { id: 1, date: '10/11/2026', dateISO:'2026-11-10', time:'08:00', status:'approved', carrier:'Translog', verified:true, invoices:['nfe'], suppliers:['A'], createdAt:'2026-10-25T10:00:00.000Z', history:[{ id:'old',title:'Agendamento aprovado',at:'2026-10-26T10:00:00.000Z' }] },
  { id: 2, date: '10/11/2026', dateISO:'2026-11-10', time:'09:00', status:'pending', carrier:'Expresso', verified:false },
  { id: 3, date: '11/11/2026', dateISO:'2026-11-11', time:'08:00', status:'rejected', carrier:'Rota' },
  { id: 4, date: '11/11/2026', dateISO:'2026-11-11', time:'09:00', status:'completed', carrier:'Via Sul' },
  { id: 5, date: '11/11/2026', dateISO:'2026-11-11', time:'10:00', status:'progress', carrier:'Via Sul' },
]
function success(result) { assert.equal(result.error, undefined, result.error); return result }
test('data e hora atuais aparecem como próprio horário, não conflito', () => {
  assert.equal(rescheduleSlotStatus(base,base[0],'2026-11-10','08:00',NOW),'current')
})
test('outro agendamento bloqueia horário', () => {
  assert.equal(rescheduleSlotStatus(base,base[0],'2026-11-10','09:00',NOW),'occupied')
  assert.match(prepareReschedule(base, 1, '2026-11-10','09:00','',NOW).error, /ocupado/)
})
test('recusado não ocupa mais o horário', () => {
  assert.equal(rescheduleSlotStatus(base,base[0],'2026-11-11','08:00',NOW),'available')
})
test('iniciados/concluídos ocupam o horário',()=> {
  assert.equal(rescheduleSlotStatus(base,base[0],'2026-11-11','09:00',NOW),'occupied')
  assert.equal(rescheduleSlotStatus(base,base[0],'2026-11-11','10:00',NOW),'occupied')
})
test('não pode mover para passado',()=> {
  assert.match(prepareReschedule(base, 1,'2026-11-04','09:30','', NOW).error,/passou/)
})
test('data inválida e horário fora da grade são recusados',()=> {
  for(const d of ['2026-02-30','2026-13-10','invalida']) assert.match(prepareReschedule(base,1,d,'07:30','',NOW).error,/válida/)
  assert.match(prepareReschedule(base,1,'2026-11-12','07:01','',NOW).error,/válida/)
})
test('mesma data e hora não gera evento novo',()=> {
  assert.match(prepareReschedule(base,1,'2026-11-10','08:00','',NOW).error,/diferente/)
})
test('aprovado volta a pendente, perde verificação, preserva dados e histórico',()=> {
  const r=success(prepareReschedule(base,1,'2026-11-12','14:00','Atraso na coleta',NOW))
  const x=r.appointment
  assert.equal(x.id,1)
  assert.equal(x.date,'12/11/2026')
  assert.equal(x.dateISO,'2026-11-12')
  assert.equal(x.time,'14:00')
  assert.equal(x.status,'pending')
  assert.equal(x.verified,false)
  assert.deepEqual(x.invoices,['nfe'])
  assert.equal(x.carrier,'Translog')
  assert.equal(x.createdAt,base[0].createdAt)
  assert.equal(x.history.length,2)
  assert.match(x.history[1].details,/Atraso na coleta/)
  assert.match(x.history[1].details,/Aguarda nova aprovação/)
  assert.deepEqual(r.appointments.slice(1),base.slice(1))
  assert.equal(findSlotConflict(r.appointments,'2026-11-10','08:00'),null)
  assert.equal(findSlotConflict(r.appointments,'2026-11-12','14:00')?.id,1)
  assert.equal(base[0].time,'08:00')
  assert.equal(base[0].history.length,1)
})
test('pendente continua pendente e registra horário antigo',()=> {
  const r=success(prepareReschedule(base,2,'2026-11-12','08:30','',NOW))
  assert.equal(r.appointment.status,'pending')
  assert.match(r.appointment.history[0].details,/10\/11\/2026 às 09:00.*12\/11\/2026 às 08:30/)
})
test('rejeitados, iniciados e concluídos não podem reagendar',()=> {
  for (const id of [3,4,5]) {
    assert.equal(canReschedule(base.find(x=>x.id===id)),false)
    assert.match(prepareReschedule(base,id,'2026-11-12','09:30','',NOW).error,/pendentes ou aprovadas/)
  }
})
test('id não localizado mostra erro',()=> {
  assert.match(prepareReschedule(base,999,'2026-11-12','09:30','',NOW).error,/não encontrado/)
})
test('id string em URL localiza registro numérico',()=> {
  const r=success(prepareReschedule(base,'1','2026-11-12','09:30','',NOW))
  assert.equal(r.appointment.id,1)
})
test('hoje só permite horário futuro',()=> {
  assert.equal(rescheduleSlotStatus(base,base[0],'2026-11-05','07:30',NOW),'past')
  assert.equal(rescheduleSlotStatus(base,base[0],'2026-11-05','14:00',NOW),'available')
})

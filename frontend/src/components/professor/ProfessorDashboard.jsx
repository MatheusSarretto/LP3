import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/client";
import {
  Book, Users, FileText, Plus, Edit, Trash2, 
  ChevronRight, Download,  CheckCircle, X
} from 'lucide-react';

export default function ProfessorDashboard ({ token }) {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);

  const [notasModal, setNotasModal] = useState({ open: false, matriculaId: null, alunoNome: '' });
  const [notasAluno, setNotasAluno] = useState([]);
  const [novaNota, setNovaNota] = useState({ descricao: '', valorNota: '', peso: '', dataAvaliacao: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [freqModal, setFreqModal] = useState({ open: false, matriculaId: null, alunoNome: '', valor: '' });

  const formatDate = (dateString) => {
      if (!dateString) return '-';
      const [ano, mes, dia] = dateString.split('-');
      return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
    const loadTurmas = async () => {
      try {
        const data = await fetchWithAuth('/professor/turmas', 'GET', null, token);
        setTurmas(data || []);
      } catch (e) { console.error(e); }
    };
    loadTurmas();
  }, [token]);

  const selectTurma = async (turma) => {
    setSelectedTurma(turma);
    try {
      const data = await fetchWithAuth(`/professor/turmas/${turma.id}/matriculas`, 'GET', null, token);
      setAlunos(data || []);
    } catch (e) { console.error(e); }
  };

  const openNotasModal = async (matricula) => {
    setNotasModal({ open: true, matriculaId: matricula.id, alunoNome: matricula.aluno.nome });
    resetFormNota();
    await loadNotas(matricula.id);
  };

  const loadNotas = async (matriculaId) => {
    try {
      const data = await fetchWithAuth(`/professor/matriculas/${matriculaId}/notas`, 'GET', null, token);
      setNotasAluno(data);
    } catch (e) { console.error(e); }
  };

  const resetFormNota = () => {
    setNovaNota({ descricao: '', valorNota: '', peso: '', dataAvaliacao: '' });
    setEditingNoteId(null);
  }

  const handleSalvarNota = async (e) => {
    e.preventDefault();
    try {
      if (editingNoteId) {
        await fetchWithAuth(`/professor/notas/${editingNoteId}`, 'PUT', novaNota, token);
      } else {
        await fetchWithAuth(`/professor/matriculas/${notasModal.matriculaId}/notas`, 'POST', novaNota, token);
      }
      await loadNotas(notasModal.matriculaId);
      resetFormNota();
      selectTurma(selectedTurma); 
    } catch (error) { alert('Erro: ' + error.message); }
  };

  const handleEditClick = (nota) => {
    setEditingNoteId(nota.id);
    setNovaNota({
        descricao: nota.descricao,
        valorNota: nota.valorNota,
        peso: nota.peso,
        dataAvaliacao: nota.dataAvaliacao || ''
    });
  };

  const handleDeleteNota = async (notaId) => {
    if(!confirm("Excluir nota?")) return;
    try {
      await fetchWithAuth(`/professor/notas/${notaId}`, 'DELETE', null, token);
      await loadNotas(notasModal.matriculaId);
      selectTurma(selectedTurma);
    } catch(e) { 
      console.error(e);
      alert("Erro ao excluir");
    }
  }

  const openFreqModal = (matricula) => {
      setFreqModal({ 
          open: true, 
          matriculaId: matricula.id, 
          alunoNome: matricula.aluno.nome, 
          valor: matricula.frequencia || '' 
      });
  };

  const handleSaveFreq = async (e) => {
      e.preventDefault();
      try {
          await fetchWithAuth(`/professor/matriculas/${freqModal.matriculaId}/frequencia`, 'PATCH', { frequencia: freqModal.valor }, token);
          setFreqModal({ ...freqModal, open: false });
          selectTurma(selectedTurma);
      } catch(error) { alert('Erro: ' + error.message); }
  }

  const downloadReport = async (type) => {
    try {
        const blob = await fetchWithAuth(`/professor/turmas/${selectedTurma.id}/relatorio/${type}`, 'GET', null, token);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pauta_${selectedTurma.id}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch(e) { 
      console.error(e);
      alert("Erro no download"); 
    }
  }

  const inputClass = "w-full border border-slate-300 p-2.5 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm placeholder:text-slate-400";

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Painel do Professor</h2>
            <p className="text-slate-500">{selectedTurma ? `Gerenciando: ${selectedTurma.disciplina.nome}` : 'Suas turmas'}</p>
        </div>
        {selectedTurma && (
             <button onClick={() => setSelectedTurma(null)} className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center shadow-lg transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180 mr-1 text-white"/> Voltar
             </button>
        )}
      </div>

      {!selectedTurma ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {turmas.map(t => (
            <div key={t.id} onClick={() => selectTurma(t)} 
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">{t.periodo}</span>
                    <Book className="w-5 h-5 text-slate-300 group-hover:text-blue-500"/>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{t.disciplina.nome}</h3>
                <p className="text-sm text-slate-500 font-mono">{t.disciplina.codigoDisciplina}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                    Clique para gerenciar
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600"/>
                    <h3 className="font-bold text-slate-700">Lista de Alunos</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => downloadReport('excel')} className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2"/> Excel
                    </button>
                    <button onClick={() => downloadReport('pdf')} className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2"/> PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Aluno</th>
                        <th className="px-6 py-4 text-center">Média Final</th>
                        <th className="px-6 py-4 text-center">Frequência</th>
                        <th className="px-6 py-4 text-center">Situação</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {alunos.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-700">{m.aluno.nome}</td>
                            <td className="px-6 py-4 text-center text-base font-bold text-slate-800">{m.mediaFinal ?? '-'}</td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2 group">
                                    <span className="text-slate-600">{m.frequencia ?? '-'}%</span>
                                    <button onClick={() => openFreqModal(m)} className="text-slate-700 hover:text-blue-600 hover:bg-blue-100 p-1" title="Editar Frequência">
                                        <Edit className="w-3 h-3"/>
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                                    m.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    m.status === 'REPROVADO' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-blue-100 text-blue-700 border-blue-200'
                                }`}>
                                    {m.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openNotasModal(m)} className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-800 shadow-sm transition-colors uppercase tracking-wide">
                                    Gerenciar Notas
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* MODAL DE NOTAS */}
      {notasModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">Lançamento de Notas</h3>
                 <p className="text-sm text-slate-500">Aluno: <span className="font-semibold text-blue-600">{notasModal.alunoNome}</span></p>
              </div>
              <button onClick={() => setNotasModal({ ...notasModal, open: false })} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 text-slate-600 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              {/* FORMULÁRIO */}
              <form onSubmit={handleSalvarNota} className={`p-5 rounded-xl mb-8 grid grid-cols-1 sm:grid-cols-12 gap-4 border ${editingNoteId ? 'bg-orange-50 border-orange-200' : 'bg-blue-50/30 border-blue-100'}`}>
                
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Descrição</label>
                  <input required placeholder="Ex: Prova 1" className={inputClass} 
                    value={novaNota.descricao} onChange={e => setNovaNota({...novaNota, descricao: e.target.value})} />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Nota</label>
                  <input required type="number" step="0.1" min="0" max="10" className={inputClass}
                    value={novaNota.valorNota} onChange={e => setNovaNota({...novaNota, valorNota: e.target.value})} />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Peso</label>
                  <input required type="number" step="0.1" min="0.1" max="1" className={inputClass}
                    value={novaNota.peso} onChange={e => setNovaNota({...novaNota, peso: e.target.value})} />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1 ml-1 uppercase">Data</label>
                  <input type="date" className={inputClass}
                    value={novaNota.dataAvaliacao} onChange={e => setNovaNota({...novaNota, dataAvaliacao: e.target.value})} />
                </div>
                
                <div className="sm:col-span-12 flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200/50">
                    {editingNoteId ? (
                        <>
                            <button type="button" onClick={resetFormNota} 
                                className="px-4 py-2 flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors text-sm font-bold shadow-sm">
                                <X className="w-4 h-4 mr-2"/> Cancelar
                            </button>
                            <button type="submit" 
                                className="px-6 py-2 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-colors text-sm font-bold">
                                <CheckCircle className="w-4 h-4 mr-2"/> Atualizar Nota
                            </button>
                        </>
                    ) : (
                        <button type="submit" 
                            className="px-6 py-2 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-md transition-colors text-sm font-bold w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2"/> Adicionar Nota
                        </button>
                    )}
                </div>
              </form>

              {/* TABELA DE NOTAS*/}
              <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4"/> Histórico
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="text-left py-3 px-4 font-bold">Avaliação</th>
                            <th className="text-center py-3 px-4 font-bold">Data</th>
                            <th className="text-center py-3 px-4 font-bold">Peso</th>
                            <th className="text-center py-3 px-4 font-bold">Nota</th>
                            <th className="text-right py-3 px-4 font-bold w-24">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {notasAluno.map(n => (
                            <tr key={n.id} className={`transition-colors ${editingNoteId === n.id ? 'bg-orange-50 border-l-4 border-orange-400' : 'hover:bg-slate-50'}`}>
                              <td className="py-3 px-4 text-slate-700 font-medium">{n.descricao}</td>
                              <td className="py-3 px-4 text-center text-slate-500 text-xs font-mono">
                                {formatDate(n.dataAvaliacao)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600 border border-slate-200">{n.peso}</span>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-slate-800 text-base">{n.valorNota}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEditClick(n)} 
                                        className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                                        title="Editar">
                                        <Edit className="w-4 h-4"/>
                                    </button>
                                    <button onClick={() => handleDeleteNota(n.id)} 
                                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                                        title="Excluir">
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {notasAluno.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-400 italic">Nenhuma nota lançada.</td></tr>}
                        </tbody>
                      </table>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FREQUÊNCIA */}
      {freqModal.open && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Atualizar Frequência</h3>
                <p className="text-sm text-slate-500 mb-4">Aluno: <span className="font-bold text-slate-800">{freqModal.alunoNome}</span></p>
                <form onSubmit={handleSaveFreq}>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Porcentagem (%)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="100" 
                        autoFocus
                        className="w-full text-center text-2xl font-bold border-2 border-blue-200 p-3 rounded-xl bg-blue-50 text-blue-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" 
                        value={freqModal.valor} 
                        onChange={e => setFreqModal({...freqModal, valor: e.target.value})} 
                    />
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setFreqModal({...freqModal, open: false})} 
                            className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" 
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

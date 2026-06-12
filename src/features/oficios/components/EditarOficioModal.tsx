import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { OficioItem } from '../types';
import supabase from '../../../utils/supabase';

interface EditarOficioModalProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  oficioId?: number;
  oficioData?: OficioItem;
}

const EditarOficioModal: React.FC<EditarOficioModalProps> = ({
  open,
  onClose,
  onSuccess,
  oficioId,
  oficioData,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    ano: '',
    remetente: '',
    destinatario: '',
    cidade: '',
    finalidade: '',
    descricao: '',
    utilizado: false,
  });

  useEffect(() => {
    if (open !== undefined) {
      setVisible(open);
    }
  }, [open]);

  useEffect(() => {
    if (oficioData) {
      setFormData({
        ano: oficioData.ano?.toString() || '',
        remetente: oficioData.remetente || '',
        destinatario: oficioData.destinatario || '',
        cidade: oficioData.cidade || '',
        finalidade: oficioData.finalidade || '',
        descricao: oficioData.descricao || '',
        utilizado: oficioData.utilizado || false,
      });
      setArquivo(null);
    }
  }, [oficioData]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, utilizado: event.target.checked });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Por favor, selecione apenas arquivos no formato PDF.');
        return;
      }
      setArquivo(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentId = oficioId || oficioData?.id;
    if (!currentId) return;
    
    setLoading(true);
    setError(null);

    try {
      let arquivoPath = oficioData?.arquivo_url || null;

      if (arquivo && oficioData) {
        const numeroOficio = oficioData.numero;
        const fileExt = arquivo.name.split('.').pop();
        
        const cidadeSanitizada = formData.cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const filePath = `${cidadeSanitizada}/${formData.ano}/OF_${numeroOficio}.${fileExt}`;

        // Upload com cacheControl: '0' forçando o Supabase a dizer ao navegador para nunca cachear o item
        const { error: uploadError } = await supabase.storage
          .from('oficios')
          .upload(filePath, arquivo, { upsert: true, cacheControl: '0' });

        if (uploadError) throw uploadError;
        arquivoPath = filePath;
      }

      const { error: updateError } = await supabase
        .from('oficios')
        .update({
          remetente: formData.remetente,
          destinatario: formData.destinatario,
          cidade: formData.cidade,
          finalidade: formData.finalidade,
          descricao: formData.descricao,
          utilizado: formData.utilizado,
          arquivo_url: arquivoPath,
        })
        .eq('id', currentId);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        handleClose();
      }, 1000);

    } catch (err: any) {
      console.error("Erro ao atualizar ofício:", err);
      setError(err.message || "Erro ao atualizar ofício");
    } finally {
      setLoading(false);
    }
  };

  const handleErrorClose = () => setError(null);
  const handleSuccessClose = () => setSuccess(false);

  return (
    <>
      <Dialog open={visible} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
            Editar Ofício Nº {oficioData?.numero}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Ano" value={formData.ano} disabled fullWidth />
            <TextField label="Remetente" value={formData.remetente} onChange={handleChange('remetente')} fullWidth required />
            <TextField label="Destinatário" value={formData.destinatario} onChange={handleChange('destinatario')} fullWidth required />
            <TextField label="Cidade" value={formData.cidade} onChange={handleChange('cidade')} fullWidth required />
            <TextField
              label="Evento"
              value={formData.finalidade}
              onChange={handleChange('finalidade')}
              fullWidth
            />
            <TextField label="Descrição" value={formData.descricao} onChange={handleChange('descricao')} fullWidth multiline rows={3} />

            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                fullWidth
                color={arquivo ? "success" : "primary"}
              >
                {oficioData?.arquivo_url 
                  ? (arquivo ? "Alterar Novo PDF Selecionado" : "Substituir PDF Anexado Existente") 
                  : (arquivo ? "PDF Selecionado" : "Anexar Arquivo PDF")}
                <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
              </Button>
              {oficioData?.arquivo_url && !arquivo && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5, color: '#4caf50', pl: 1 }}>
                  ✓ Este ofício já possui um arquivo PDF salvo no sistema.
                </Typography>
              )}
              {arquivo && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary', pl: 1 }}>
                  Novo arquivo pronto: <strong>{arquivo.name}</strong>
                </Typography>
              )}
            </Box>

            <FormControlLabel
              control={<Checkbox checked={formData.utilizado} onChange={handleCheckboxChange} name="utilizado" />}
              label="Utilizado"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleClose}>CANCELAR</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? 'SALVANDO...' : 'SALVAR'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleErrorClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleErrorClose} severity="error" variant="filled">{error}</Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={4000} onClose={handleSuccessClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSuccessClose} severity="success" variant="filled">Ofício atualizado com sucesso!</Alert>
      </Snackbar>
    </>
  );
};

export default EditarOficioModal;
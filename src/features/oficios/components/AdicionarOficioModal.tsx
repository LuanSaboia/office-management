import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import supabase from '../../../utils/supabase';

interface AdicionarOficioModalProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const AdicionarOficioModal: React.FC<AdicionarOficioModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [visible, setVisible] = useState(false);
  const currentYear = new Date().getFullYear();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    ano: currentYear.toString(),
    remetente: '',
    destinatario: '',
    cidade: 'Crateús',
    finalidade: '',
    descricao: '',
    utilizado: false,
  });

  useEffect(() => {
    if (open !== undefined) {
      setVisible(open);
    }
  }, [open]);

  const handleOpen = () => setVisible(true);

  const handleClose = () => {
    resetForm();
    setVisible(false);
    if (onClose) onClose();
  };

  const resetForm = () => {
    setFormData({
      ano: currentYear.toString(),
      remetente: '',
      destinatario: '',
      cidade: 'Crateús',
      finalidade: '',
      descricao: '',
      utilizado: false,
    });
    setArquivo(null);
    setError(null);
  };

  const handleChange =
    (field: string) =>
      (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
        const value = event.target.value;
        setFormData({ ...formData, [field]: value });
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
    setLoading(true);
    setError(null);

    const payload = {
      ano: Number(formData.ano),
      remetente: formData.remetente,
      destinatario: formData.destinatario,
      cidade: formData.cidade,
      finalidade: formData.finalidade,
      descricao: formData.descricao,
      utilizado: formData.utilizado,
    };

    let idOficioCriado: number | null = null;

    try {
      const { data, error: funcError } = await supabase.functions.invoke('add_oficio', {
        body: payload,
      });

      if (funcError) throw funcError;

      if (data && data.id) {
        idOficioCriado = data.id;
      }

      if (arquivo && data) {
        const numeroOficio = data.numero || data.id; 
        const fileExt = arquivo.name.split('.').pop();
        
        const cidadeSanitizada = formData.cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const filePath = `${cidadeSanitizada}/${formData.ano}/OF_${numeroOficio}.${fileExt}`;

        // Upload com cacheControl configurado para zero
        const { error: uploadError } = await supabase.storage
          .from('oficios')
          .upload(filePath, arquivo, { upsert: true, cacheControl: '0' });

        if (uploadError) throw uploadError;

        const { error: updateError } = await supabase
          .from('oficios')
          .update({ arquivo_url: filePath })
          .eq('id', data.id);

        if (updateError) throw updateError;
      }

      setSuccess(true);
      resetForm();
      setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }, 1000);

    } catch (err: any) {
      console.error("Erro detectado durante a operação:", err);
      if (idOficioCriado) {
        await supabase.from('oficios').delete().eq('id', idOficioCriado);
      }
      setError(err.message || "Erro ao processar o salvamento do ofício e anexo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSuccess(false);

  const cidadesOptions = ['Crateús', 'Nova Russas', 'Ipueiras'];

  if (open === undefined) {
    return (
      <>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Adicionar Ofício
        </Button>

        <Dialog open={visible} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Adicionar Novo Ofício</DialogTitle>
          <DialogContent>{renderForm()}</DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : null}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={success}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success">
            Ofício adicionado com sucesso!
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Dialog open={visible} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Adicionar Novo Ofício</DialogTitle>
        <DialogContent>{renderForm()}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : null}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Ofício adicionado com sucesso!
        </Alert>
      </Snackbar>
    </>
  );

  function renderForm() {
    return (
      <Box sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Ano" value={formData.ano} disabled fullWidth required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Remetente"
              value={formData.remetente}
              onChange={handleChange('remetente')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Destinatário"
              value={formData.destinatario}
              onChange={handleChange('destinatario')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="cidade-label">Cidade</InputLabel>
              <Select
                labelId="cidade-label"
                value={formData.cidade}
                onChange={handleChange('cidade') as unknown as (event: SelectChangeEvent) => void}
                label="Cidade"
              >
                {cidadesOptions.map((cidade) => (
                  <MenuItem key={cidade} value={cidade}>
                    {cidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Evento"
              value={formData.finalidade}
              onChange={handleChange('finalidade')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={handleChange('descricao')}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
              fullWidth
              color={arquivo ? "success" : "primary"}
            >
              {arquivo ? "Alterar Arquivo PDF Selecionado" : "Anexar Arquivo do Ofício (PDF)"}
              <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
            </Button>
            {arquivo && (
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', pl: 1 }}>
                Arquivo pronto para upload: <strong>{arquivo.name}</strong>
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.utilizado} onChange={handleCheckboxChange} color="primary" />}
              label="Ofício Utilizado"
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
};

export default AdicionarOficioModal;
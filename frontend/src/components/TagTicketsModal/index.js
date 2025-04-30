import React from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Typography,
  CircularProgress,
  Chip,
  Box,
} from "@material-ui/core";
import {
  CheckCircleOutline as OpenIcon,
  ErrorOutline as ClosedIcon,
  Schedule as PendingIcon,
} from "@material-ui/icons";
import * as XLSX from 'xlsx';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: 'auto',
    [theme.breakpoints.up('sm')]: {
      minWidth: 500,
    },
    maxHeight: 500,
    overflow: "auto",
  },
  ticketItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1),
    },
  },
  tagChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  contactInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
}));

const StatusIcon = ({ status }) => {
  const statusLower = status.toLowerCase();
  return (
    <>
      {statusLower === 'open' && <OpenIcon style={{ color: '#4CAF50' }} />}
      {statusLower === 'closed' && <ClosedIcon style={{ color: '#F44336' }} />}
      {statusLower === 'pending' && <PendingIcon style={{ color: '#FFC107' }} />}
    </>
  );
};

const TagTicketsModal = ({ open, onClose, tickets, loading, currentTag }) => {
  const classes = useStyles();
  const theme = useTheme();

  const filteredTickets = tickets.filter(ticket => 
    ticket.tags?.some(tag => tag.id === currentTag?.id)
  );

  const handleDownloadContacts = () => {
    const data = filteredTickets.map(ticket => ({
      'Nome do Contato': ticket.contact.name,
      'Número do Contato': ticket.contact.number,
      'Email do Contato': ticket.contact.email || 'Não informado',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contatos");

    XLSX.writeFile(wb, `contatos_tag_${currentTag.name}.xlsx`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={window.innerWidth < 600}>
      <DialogTitle>
        Tickets com a tag: 
        <Chip 
          size={window.innerWidth < 600 ? "small" : "medium"}
          style={{ 
            backgroundColor: currentTag?.color, 
            color: "white",
            marginLeft: 8,
            fontSize: '0.9rem'
          }} 
          label={currentTag?.name} 
        />
      </DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : filteredTickets.length > 0 ? (
          <List>
            {filteredTickets.map((ticket, index) => (
              <ListItem 
                key={ticket.id} 
                className={classes.ticketItem}
                style={{
                  backgroundColor: index % 2 === 0 ? 
                    theme.palette.background.default : 
                    theme.palette.background.paper,
                  borderLeft: ticket.unreadMessages ? 
                    `4px solid ${theme.palette.primary.main}` : 
                    'none'
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" component="div" style={{ fontWeight: 600 }}>
                          {ticket.contact.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {ticket.contact.number}
                        </Typography>
                        {ticket.contact.email && (
                          <Typography variant="caption" color="textSecondary" component="div">
                            {ticket.contact.email}
                          </Typography>
                        )}
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" component="div" color="textSecondary">
                          #{ticket.id}
                        </Typography>
                        <Chip 
                          label={
                            ticket.status.toLowerCase() === 'open' ? 'Aberto' :
                            ticket.status.toLowerCase() === 'closed' ? 'Fechado' : 'Pendente'
                          } 
                          size="small" 
                          icon={<StatusIcon status={ticket.status} />}
                          style={{
                            backgroundColor: 
                              ticket.status.toLowerCase() === 'open' ? '#4caf50' :
                              ticket.status.toLowerCase() === 'closed' ? '#f44336' : '#ff9800',
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <>
                      <Box mt={1} mb={1}>
                        {ticket.tags?.map(tag => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            style={{ 
                              backgroundColor: tag.color, 
                              color: 'white', 
                              marginRight: 4,
                              marginBottom: 4 
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" paragraph style={{ marginBottom: 8 }}>
                        <Box component="span" fontWeight="500">Última mensagem:</Box> {ticket.lastMessage}
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" color="textSecondary">
                          Criado em: {new Date(ticket.createdAt).toLocaleString()}
                        </Typography>
                        {ticket.updatedAt !== ticket.createdAt && (
                          <Typography variant="caption" color="textSecondary">
                            Atualizado: {new Date(ticket.updatedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </>
                  }
                />
                {ticket.unreadMessages > 0 && (
                  <Box position="absolute" right={16} top={16}>
                    <Chip 
                      label={`${ticket.unreadMessages}`} 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Box py={2} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Nenhum ticket encontrado com esta tag
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box className={classes.buttonGroup}>
          {filteredTickets.length > 0 && (
            <Button 
              onClick={handleDownloadContacts} 
              color="secondary" 
              variant="contained"
            >
              Exportar Contatos
            </Button>
          )}
          <Button onClick={onClose} color="primary" variant="contained">
            Fechar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TagTicketsModal;
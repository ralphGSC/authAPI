'use strict';

var base64 = require('base-64');
var utf8 = require('utf8');
var ipconfig = require('ip');

const repository = require('../repositories/autenticacao-repository');
const authService = require('../services/auth-service');

exports.post = async (req, res, next) => {
    try {
        //let bytes = utf8.encode(req.body.SENHA);
        //let senhaEncode = base64.encode(bytes);
        let agent = req.headers['user-agent'];
        let ip = ipconfig.address();         
      
        // Verifica se foi informado o COD_SISTEMA no body
        if(req.body.COD_SISTEMA == undefined){
            res.status(400).send({              
                MSN: 'Favor informar código do sistema'
            });
            return;
        }  
     
        // Obtém dados do usuário
        let usuario = await repository.getUsuario({
            LOGIN: req.body.LOGIN,
            SENHA: req.body.SENHA
        });
      
        // Obtém dados do funcionário
        let funcionario = await repository.getFuncionario({
            CHAPA: usuario.MATRICULA
        });      

        // Verificar se autenticação
        if (!usuario) {
            res.status(404).send({              
                MSN: 'Usuário e/ou senha inválido(s)'
            });
            return;
        }

        // Retornar as permissões do usuário
        let permissoes = await repository.getPermissoes({
            COD_USUARIO: usuario.COD_USUARIO,
            COD_SISTEMA: req.body.COD_SISTEMA
        });           

        if (permissoes.length == 0) {
            res.status(404).send({              
                MSN: 'Acesso negado ao sistema: ' + req.body.COD_SISTEMA 
            });
            return;
        }

        // Inserir log de entrada no sistema
        await repository.insSPD_LOG_LOGON({
            COD_USUARIO: usuario.COD_USUARIO,
            COD_SISTEMA: req.body.COD_SISTEMA,
            AGENTE: agent,
            IP: ip               
        });            

        const token = await authService.encodeToken({
            COD_USUARIO: usuario.COD_USUARIO,
            LOGIN: usuario.LOGIN,
            MATRICULA: usuario.MATRICULA
        });

        res.status(201).send({
            TOKEN: token,
            USUARIO: {
                COD_USUARIO: usuario.COD_USUARIO,
                LOGIN: usuario.LOGIN,
                MATRICULA: usuario.MATRICULA,
                NOME_USUARIO: usuario.NOME_USUARIO,
                EMAIL: usuario.EMAIL
            },
            FUNCIONARIO: funcionario,
            PERMISSOES: permissoes            
        });
       
    } catch (e) {
        console.log(e);
        res.status(500).send({           
            MSN: 'Falha ao processar requisição'
        });
    }
};
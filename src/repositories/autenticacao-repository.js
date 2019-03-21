'use strict';

const db = require('../services/database-service');

exports.getUsuario = async (data) => {   
    const res = await db.comandText(`SELECT COD_USUARIO, LOGIN, 
                                            MATRICULA, NOME_USUARIO, EMAIL
                                       FROM SPD_USUARIO 
                                      WHERE LOGIN = '${data.LOGIN}' AND SENHA = '${data.SENHA}'`);
    return res.rows[0];
}

exports.getFuncionario = async (data) => {   
    const res = await db.comandText(`SELECT CHAPA, CODSITUACAO, DATAADMISSAO,
                                            CENTROCUSTO, GERENCIA, CODSECAO, NOMEGERENCIA, 
                                            FUNCAO, IMAGEM
                                       FROM VW_SCF_FUNCIONARIO_RM  
                                      WHERE CHAPA = '${data.CHAPA}'`);
    return res.rows[0];
}

exports.insSPD_LOG_LOGON = async (data) => {
    const res = await db.comandText(`INSERT INTO SPD_LOG_LOGON 
                                    (COD_USUARIO, COD_SISTEMA, AGENTE, IP)
                                    VALUES
                                    (${data.COD_USUARIO}, ${data.COD_SISTEMA}, '${data.AGENTE}', '${data.IP}')`);
    return res;
}

exports.getPermissoes = async (data) => {
    const res = await db.comandText(`SELECT DISTINCT MD.COD_MODULO, MD.DESC_MODULO, MD.COD_ORDEM, MD.DESC_EXIBICAO 
                                       FROM SPD_PERFIL_ACESSO PA, SPD_PERFIL PF, SPD_MODULO_SUB MS, SPD_MODULO MD, SPD_SISTEMA ST 
                                      WHERE PA.COD_PERFIL = PF.COD_PERFIL
                                        AND PA.COD_SUBMODULO = MS.COD_SUBMODULO
                                        AND MS.COD_MODULO = MD.COD_MODULO 
                                        AND MD.COD_SISTEMA = ST.COD_SISTEMA 
                                        AND PA.COD_PERFIL IN 
                                        (SELECT COD_PERFIL FROM SPD_USUARIO_PERFIL WHERE COD_USUARIO = ${data.COD_USUARIO})  
                                        AND MD.COD_SISTEMA = ${data.COD_SISTEMA} ORDER BY MD.COD_ORDEM`);
    return res.rows;
}

create database ifsp_db;
use ifsp_db;

create table usuarios (
    id int auto_increment primary key,
    nome varchar(255) not null,
    email varchar(255) not null unique,
    senha varchar(255) not null,
    role enum('aluno', 'professor', 'administrador') not null,
    data_criacao timestamp default current_timestamp,
    data_atualizacao timestamp default current_timestamp on update current_timestamp
);

create table disciplinas (
    id int auto_increment primary key,
    nome varchar(255) not null,
    codigo_disciplina varchar(50) not null unique,
    descricao text null,
    carga_horaria int null,
    data_criacao timestamp default current_timestamp,
    data_atualizacao timestamp default current_timestamp on update current_timestamp
);

create table turmas (
    id int auto_increment primary key,
    disciplina_id int not null,
    professor_id int not null,
    periodo varchar(50) not null,
    horario varchar(100) null,
    local_sala varchar(100) null,
    data_criacao timestamp default current_timestamp,
    data_atualizacao timestamp default current_timestamp on update current_timestamp,
    foreign key (disciplina_id) references disciplinas(id) on delete restrict,
	foreign key (professor_id) references usuarios(id) on delete restrict
);

create table matriculas (
    id int auto_increment primary key,
    aluno_id int not null,
    turma_id int not null,
    media_final decimal(5, 2) null,
    frequencia decimal(5, 2) null,
    status enum('cursando', 'aprovado', 'reprovado_nota', 'reprovado_frequencia', 'trancado') not null default 'cursando',
    data_criacao timestamp default current_timestamp,
    data_atualizacao timestamp default current_timestamp on update current_timestamp,
    foreign key (aluno_id) references usuarios(id) on delete restrict,
	foreign key (turma_id) references turmas(id) on delete cascade,
    unique key aluno_turma (aluno_id, turma_id)
);

create table notas (
    id int auto_increment primary key,
    matricula_id int not null,
    descricao varchar(255) not null,
    valor_nota decimal(5, 2) not null,
    peso decimal(3, 2) not null default 1.00,
    data_avaliacao date null,
	foreign key (matricula_id) references matriculas(id) on delete cascade
)
